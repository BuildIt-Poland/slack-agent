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

exports.createBooking = async (bookingDate, city, userName) => {
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

exports.bookParkingPlace = (bookingDate, city, userName) => {};
