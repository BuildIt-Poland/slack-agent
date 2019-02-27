const _ = require('lodash');
const { isVerified } = require('../security/authorization.js');
const { unbookParkingPlace } = require('../dao/bookings.js');
const { success, unauthorized, internalServerError } = require('../utilities/reponseBuilder.js');
const { isCity, isFutureDate } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { SIGNING_SECRET, ENV_STAGE } = require('../config/all.js');

module.exports.delete = async (event) => {
  if (!await isVerified(event, SIGNING_SECRET, ENV_STAGE)) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    dates: {
      isFutureDate,
      required: (date) => !!date
    },
    city: {
      pattern: isCity,
      required: (date) => !!date
    },
    userName: {}
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const { dates, city, userName } = message;

  const bookingPromises = _.map([ dates ], async (bookingDate) => {
    return unbookParkingPlace(bookingDate, city, userName);
  });

  await Promise.all(bookingPromises).catch(() => {
    return internalServerError();
  });

  return success(generateResponseBody(`Reservation deleted`));
};
