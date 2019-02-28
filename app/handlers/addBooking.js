const _ = require('lodash');
const auth = require('../services/authService');
const {
  bookingExists,
  bookParkingPlace,
  createBooking,
  isBookingAvailableForPeriod,
} = require('../dao/bookings.js');

const { success, internalServerError, unauthorized } = require('../utilities/reponseBuilder.js');
const { isCity, isFutureDate } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');

module.exports.add = async event => {
  const isVerified = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isVerified) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    dates: {
      isFutureDate,
      required: date => !!date,
    },
    city: {
      pattern: isCity,
      required: date => !!date,
    },
    userName: {},
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const { dates, city, userName } = message;

  const isBookingAvailable = await isBookingAvailableForPeriod([dates], city);
  if (!isBookingAvailable) {
    return internalServerError(); // TODO raise proper response
  }

  const bookingPromises = _.map([dates], async bookingDate => {
    if (await bookingExists(bookingDate, city)) {
      return bookParkingPlace(bookingDate, city, userName);
    }

    return createBooking(bookingDate, city, userName);
  });

  await Promise.all(bookingPromises).catch(() => {
    return internalServerError();
  });

  return success(generateResponseBody(`You booked a parking place in ${city} on ${dates}`));
};
