const _ = require('lodash');
const { getParkingPlaces } = require('./parkingPlace.js');
const { query, save, update } = require('../services/dbService.js');
const { parseCurrentDate } = require('../services/dateService.js');

const { BOOKINGS_TABLE } = require('../../config/all.js');

const isBookingAvailableForPeriod = async (bookingDates, city) => {
  const params = {
    KeyConditionExpression: 'City = :city and BookingDate between :minDate and :maxDate',
    ExpressionAttributeValues: {
      ':city': city,
      ':minDate': _.min(bookingDates),
      ':maxDate': _.max(bookingDates),
    },
  };

  const { Items } = await query(params, BOOKINGS_TABLE);
  return _.every(Items, booking =>
    _.some(booking.Places, placeBooking => placeBooking.Owner === 'free'),
  );
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

const createBooking = async (bookingDate, city, userName) => {
  const parkingPlaces = _.map(await getParkingPlaces(city), ({ PlaceID }, index) => ({
    PlaceID,
    Owner: index === 0 ? userName : 'free',
  }));

  return save(
    {
      City: city,
      BookingDate: bookingDate,
      Places: parkingPlaces,
    },
    BOOKINGS_TABLE,
  );
};

const updateBookingWithOwner = async (bookingDate, city, currentOwner, newOwner) => {
  const { Places: places } = await getBooking(bookingDate, city);
  const freePlaceIndex = _.findIndex(places, { Owner: currentOwner });
  if (freePlaceIndex === -1) {
    return {};
  }
  places[freePlaceIndex].Owner = newOwner;
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

  return update(params, BOOKINGS_TABLE);
};

const bookParkingPlace = async (bookingDate, city, userName) =>
  updateBookingWithOwner(bookingDate, city, 'free', userName);

const unbookParkingPlace = async (bookingDate, city, userName) =>
  updateBookingWithOwner(bookingDate, city, userName, 'free');

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
  const futureBookingsPromises = _.map(['GDN', 'WAW'], city => getFutureBookingsByCity(city));
  const futureBookings = await Promise.all(futureBookingsPromises);
  return _.flatten(futureBookings);
};

module.exports = {
  bookingExists,
  bookParkingPlace,
  createBooking,
  getBooking,
  isBookingAvailableForPeriod,
  unbookParkingPlace,
  updateBookingWithOwner,
  getFutureBookings,
};
