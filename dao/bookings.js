const _ = require('lodash');
const log = require('../services/loggerService.js');
const { getParkingPlaces } = require('./parkingPlace.js');
const { query, save, update } = require('../services/dbService.js');

const { BOOKINGS_TABLE } = require('../config/all.js');

exports.isBookingAvailableForPeriod = (bookingDates, city) => {};

exports.bookingExists = async (bookingDate, city) => {
  const params = {
    KeyConditionExpression: 'City=:city and BookingDate = :bookingDate',
    ExpressionAttributeValues: {
      ':bookingDate': bookingDate,
      ':city': city,
    },
  };

  const { Items } = await query(params, BOOKINGS_TABLE);

  return !_.isEmpty(Items);
};

exports.createBooking = async (bookingDate, city) => {
  const parkingPlaces = await getParkingPlaces(city);

  return save({
    City: city,
    BookingDate: bookingDate,
    Places: parkingPlaces,
  }, BOOKINGS_TABLE)
};

exports.bookParkingPlace = (bookingDate, city) => {
};

const putReservation = async (place, reservationParams) => {
  const params = {
    Id: reservationParams.dates,
    City: 'multiple',
    Reservations: [
      {
        ...place,
        Reservation: reservationParams.userName,
      },
    ],
  };

  try {
    await save(params, BOOKINGS_TABLE);
  } catch (error) {
    log.error('reservation.putReservation', error);
    return false;
  }
  return true;
};

const updateReservation = async (reservationId, place, userName) => {
  const params = {
    Key: { Id: reservationId, City: 'multiple' },
    UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
    ExpressionAttributeNames: { '#reservations': 'Reservations' },
    ExpressionAttributeValues: {
      ':place': [
        {
          ...place,
          Reservation: userName,
        },
      ],
    },
  };

  try {
    await update(params, BOOKINGS_TABLE);
  } catch (error) {
    log.error('reservation.updateReservation', error);
    return false;
  }
  return true;
};

const findPlacesInCity = async city => {
  const params = {
    KeyConditionExpression: 'City = :city',
    ExpressionAttributeValues: {
      ':city': city,
    },
    IndexName: 'city-index',
  };

  try {
    const { Items } = await query(params, BOOKINGS_TABLE);
    return Items;
  } catch (error) {
    log.error('reservation.findPlacesInCityAsync', error);
    return null;
  }
};

const findIndexPlaceReservation = (reservation, reservationParams) =>
  reservation.Reservations.findIndex(
    place =>
      place.Reservation === reservationParams.userName && place.City === reservationParams.city,
  );

exports.saveReservation = async (reservationId, place, reservationParams) =>
  !reservationId
    ? putReservation(place, reservationParams)
    : updateReservation(reservationId, place, reservationParams.userName);

exports.findReservationByDate = async date => {
  const params = {
    KeyConditionExpression: '#id = :dates and City = :city',
    ExpressionAttributeNames: {
      '#id': 'Id',
    },
    ExpressionAttributeValues: {
      ':dates': date,
      ':city': 'multiple',
    },
  };

  try {
    const { Items } = await query(params, BOOKINGS_TABLE);
    return Items[0] || {};
  } catch (error) {
    log.error('reservation.findReservationByDate', error);
    return null;
  }
};

exports.findFreePlace = async (reservation, city) => {
  const places = await findPlacesInCity(city);
  if (!places) {
    return null;
  }

  if (_.isEmpty(reservation)) {
    return places[0] || {};
  }

  return places.find(place => !reservation.Reservations.some(item => place.Id === item.Id)) || {};
};

exports.listReservationsForDay = async (reservation, city) => {
  const places = await findPlacesInCity(city);
  if (!places) {
    return null;
  }

  if (_.isEmpty(reservation)) {
    return places.map(place => ({
      ...place,
      Reservation: 'free',
    }));
  }

  return places.map(place => {
    const res = reservation.Reservations.find(item => place.Id === item.Id);

    return (
      res || {
        ...place,
        Reservation: 'free',
      }
    );
  });
};

exports.deleteReservationPlace = async (reservation, reservationParams) => {
  const placeIndex = findIndexPlaceReservation(reservation, reservationParams);
  if (placeIndex === -1) {
    return false;
  }

  try {
    await update({
      Key: { Id: reservation.Id, City: 'multiple' },
      UpdateExpression: `REMOVE Reservations[${placeIndex}]`,
    });
  } catch (error) {
    log.error('reservation.deleteReservation', error);
    return false;
  }

  return true;
};
