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
const { PARKING_PLACE_DO_NOT_EXIST, CITY_DO_NOT_EXIST, PARKING_PLACE_IS_NOT_AVAILABLE, BOOK_PARKING_PLACE } = require('../utilities/responseMessages.js');

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
    return success(generateResponseBody(CITY_DO_NOT_EXIST(city)))
  }

  if (placeId && !(await parkingPlaceExists(placeId, city))) {
    return success(generateResponseBody(PARKING_PLACE_DO_NOT_EXIST(placeId)));
  }

  const isBookingAvailable = await isBookingAvailableForPeriod(dates, city, placeId);

  if (!isBookingAvailable) {
    return success(generateResponseBody(PARKING_PLACE_IS_NOT_AVAILABLE(placeId))); // TODO raise proper response
  }

  const bookingPromises = _.map(dates, async bookingDate => {
    if (await bookingExists(bookingDate, city)) {
      return bookParkingPlace(bookingDate, city, userName, placeId);
    }
    return createBookingAndBookParkingPlace(bookingDate, city, userName, placeId);
  });

  return Promise.all(bookingPromises)
    .then(([{ PlaceID }]) => {
      return success(generateResponseBody(BOOK_PARKING_PLACE(PlaceID, city, dates)));
    })
    .catch(() => {
      return internalServerError();
    });
};
