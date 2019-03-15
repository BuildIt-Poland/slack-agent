const _ = require('lodash');
const { isVerified } = require('../services/authService');
const {
  bookingExists,
  bookParkingPlace,
  createBooking,
  isBookingAvailableForPeriod,
} = require('../dao/bookings.js');

const { success, internalServerError, unauthorized } = require('../utilities/reponseBuilder.js');
const { isCity } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');

module.exports.book = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    dates: {
      required: date => !_.isEmpty(date),
    },
    city: {
      pattern: isCity,
      required: city => !!city,
    },
    palceId: {},
    userName: {},
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const { dates, city, userName } = message;

  const isBookingAvailable = await isBookingAvailableForPeriod(dates, city, message.palceId);

  if (!isBookingAvailable) {
    return internalServerError(); // TODO raise proper response
  }

  const bookingPromises = _.map(dates, async bookingDate => {
    if (await bookingExists(bookingDate, city)) {
      return bookParkingPlace(bookingDate, city, userName, message.palceId);
    }
    return createBooking(bookingDate, city, userName, message.palceId);
  });

  return Promise.all(bookingPromises)
    .then(() => {
      return success(generateResponseBody(`You booked a parking place in ${city} on ${dates}`));
    })
    .catch(() => {
      return internalServerError();
    });
};
