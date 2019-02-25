const _ = require('lodash');
const dynamo = require('../services/daoService.js');
const log = require('../services/loggerService.js');

async function putReservation(place, reservationParams) {
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
    await dynamo.save(params);
  } catch (error) {
    log.error('reservation.putReservation', error);
    return false;
  }
  return true;
}

async function updateReservation(reservationId, place, userName) {
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
    await dynamo.update(params);
  } catch (error) {
    log.error('reservation.updateReservation', error);
    return false;
  }
  return true;
}

async function findPlacesInCityAsync(city) {
  const params = {
    KeyConditionExpression: 'City = :city',
    ExpressionAttributeValues: {
      ':city': city,
    },
    IndexName: 'city-index',
  };

  try {
    const { Items } = await dynamo.query(params);
    return Items;
  } catch (error) {
    log.error('reservation.findPlacesInCityAsync', error);
    return null;
  }
}

function findIndexPlaceReservation(reservation, reservationParams) {
  return reservation.Reservations.findIndex(
    place =>
      place.Reservation === reservationParams.userName && place.City === reservationParams.city,
  );
}

exports.saveReservationAsync = async (reservationId, place, reservationParams) =>
  !reservationId
    ? putReservation(place, reservationParams)
    : updateReservation(reservationId, place, reservationParams.userName);

exports.findReservationByDateAsync = async date => {
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
    const { Items } = await dynamo.query(params);
    return Items[0] || {};
  } catch (error) {
    log.error('reservation.findReservationByDateAsync', error);
    return null;
  }
};

exports.findFreePlaceAsync = async (reservation, city) => {
  const places = await findPlacesInCityAsync(city);
  if (!places) {
    return null;
  }

  if (_.isEmpty(reservation)) {
    return places[0] || {};
  }

  return places.find(place => !reservation.Reservations.some(item => place.Id === item.Id)) || {};
};

exports.listReservationsForDayAsync = async (reservation, city) => {
  const places = await findPlacesInCityAsync(city);
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
    await dynamo.update({
      Key: { Id: reservation.Id, City: 'multiple' },
      UpdateExpression: `REMOVE Reservations[${placeIndex}]`,
    });
  } catch (error) {
    log.error('reservation.deleteReservation', error);
    return false;
  }

  return true;
};
