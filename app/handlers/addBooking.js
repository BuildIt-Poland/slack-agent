const _ = require('lodash');
const { isVerified } = require('../services/authService');
const {
  bookingExists,
  bookParkingPlace,
  createBookingAndBookParkingPlace,
  isBookingAvailableForPeriod,
} = require('../dao/bookings.js');
const { parkingPlaceExists, cityExists } = require('../dao/parkingPlace.js');

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
    placeId: {},
    userName: {},
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const { dates, city, userName, placeId } = message;

  if (!(await cityExists(city))) {
    return success(generateResponseBody(`City ${city} doesn’t exist`))
  }

  if (placeId && !(await parkingPlaceExists(placeId, city))) {
    return success(generateResponseBody(`Parking place ${placeId} doesn't exist`));
  }

  const isBookingAvailable = await isBookingAvailableForPeriod(dates, city, placeId);

  if (!isBookingAvailable) {
    return success(generateResponseBody(`Parking palce ${placeId} isn't available`)); // TODO raise proper response
  }

  const bookingPromises = _.map(dates, async bookingDate => {
    if (await bookingExists(bookingDate, city)) {
      return bookParkingPlace(bookingDate, city, userName, placeId);
    }
    return createBookingAndBookParkingPlace(bookingDate, city, userName, placeId);
  });

  return Promise.all(bookingPromises)
    .then(({ placeID }) => {
      return success(generateResponseBody(`You booked a parking place ${placeID} in ${city} on ${dates}`));
    })
    .catch(() => {
      return internalServerError();
    });
};
