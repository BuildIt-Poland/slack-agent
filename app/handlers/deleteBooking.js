const _ = require('lodash');
const { isVerified } = require('../services/authService.js');
const { unbookParkingPlace } = require('../dao/bookings.js');
const { success, unauthorized, internalServerError } = require('../utilities/reponseBuilder.js');
const { isCity } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { DELETE_RESERVATION } = require('../utilities/responseMessages.js');
const { SIGNING_SECRET, ENV_STAGE } = require('../../config/all.js');

module.exports.unbook = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    dates: {
      required: date => !_.isEmpty(date),
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

  const bookingPromises = _.map(dates, async bookingDate => {
    return unbookParkingPlace(bookingDate, city, userName);
  });

  await Promise.all(bookingPromises).catch(() => {
    return internalServerError();
  });

  return success(generateResponseBody(DELETE_RESERVATION));
};
