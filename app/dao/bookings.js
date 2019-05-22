const _ = require('lodash');
const { getParkingPlaces } = require('./parkingPlace.js');
const { query, save, update } = require('../services/dbService.js');
const { parseCurrentDate } = require('../services/dateService.js');
const {
  decoratedParkingPlaces,
  changeParkingPlaceOwner,
  findParkingPlaceIndex,
} = require('../services/parkingPlacesService.js');
const {
  isBookingAvailableForAnyPlace,
  isBookingAvailableForSpecificPlace,
} = require('../services/bookingsService.js');

const { BOOKINGS_TABLE } = require('../../config/all.js');

const isBookingAvailableForPeriod = async (bookingDates, city, placeId) => {
  const params = {
    KeyConditionExpression: 'City = :city and BookingDate between :minDate and :maxDate',
    ExpressionAttributeValues: {
      ':city': city,
      ':minDate': _.min(bookingDates),
      ':maxDate': _.max(bookingDates),
    },
  };

  const { Items } = await query(params, BOOKINGS_TABLE);

  if (placeId) {
    return isBookingAvailableForSpecificPlace(Items, placeId);
  }

  return isBookingAvailableForAnyPlace(Items);
};

const getBooking = async (bookingDate, city) => {
  const params = {
    KeyConditionExpression: 'City=:city and BookingDate = :bookingDate',
    ExpressionAttributeValues: {
      ':bookingDate': bookingDate,
      ':city': city,
    },
  };

  const { Items } = await query(params, BOOKINGS_TABLE);
  return Items[0] || {};
};

const bookingExists = async (bookingDate, city) => !_.isEmpty(await getBooking(bookingDate, city));

const createBookingAndBookParkingPlace = async (bookingDate, city, userName, placeId) => {
  const allParkingPlaces = await getParkingPlaces(city);

  const decoratedPlaces = decoratedParkingPlaces(allParkingPlaces, { Owner: 'free' });

  const parkingPlaces = changeParkingPlaceOwner(decoratedPlaces, userName, placeId);

  await save(
    {
      City: city,
      BookingDate: bookingDate,
      Places: parkingPlaces,
    },
    BOOKINGS_TABLE,
  );

  return placeId ? { PlaceID: placeId } : parkingPlaces[0];
};

const updateParkingPlaceInBooking = async (bookingDate, city, currentOwner, newOwner, placeId) => {
  const { Places: places } = await getBooking(bookingDate, city);
  const placeIndex = findParkingPlaceIndex(places, currentOwner, placeId);

  if (placeIndex === -1) {
    return {};
  }

  places[placeIndex].Owner = newOwner;

  const params = {
    Key: {
      City: city,
      BookingDate: bookingDate,
    },
    UpdateExpression: 'set Places = :places',
    ExpressionAttributeValues: {
      ':places': places,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  await update(params, BOOKINGS_TABLE);

  return places[placeIndex];
};

const bookParkingPlace = async (bookingDate, city, userName, placeId) =>
  updateParkingPlaceInBooking(bookingDate, city, 'free', userName, placeId);

const unbookParkingPlace = async (bookingDate, city, userName) =>
  updateParkingPlaceInBooking(bookingDate, city, userName, 'free');

const getFutureBookingsByCity = async city => {
  const params = {
    KeyConditionExpression: 'City=:city AND BookingDate >= :bookingDate',
    ExpressionAttributeValues: {
      ':bookingDate': parseCurrentDate(),
      ':city': city,
    },
  };

  const { Items } = await query(params, BOOKINGS_TABLE);
  return Items;
};

const getFutureBookings = async () => {
  const futureBookingsPromises = _.map(['Gdansk', 'Warszawa'], city => getFutureBookingsByCity(city));
  const futureBookings = await Promise.all(futureBookingsPromises);
  return _.flatten(futureBookings);
};

module.exports = {
  bookingExists,
  bookParkingPlace,
  createBookingAndBookParkingPlace,
  getBooking,
  isBookingAvailableForPeriod,
  unbookParkingPlace,
  getFutureBookings,
};
