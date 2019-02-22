const _ = require('lodash');
const auth = require('../security/authorization.js');
const res = require('../workers/reservation.js');
const { success, internalServerError, unauthorized } = require('../utility/reponseBuilder.js');
const { isCity, isFutureDate } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody } = require('../utility/responseBody.js');

const { ENV_STAGE, SIGNING_SECRET, TABLE_NAME } = require('../config/all.js');

module.exports.book = async event => {
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

  const reservation = await res.findReservationByDateAsync(message.dates, TABLE_NAME);
  if (!reservation) {
    return internalServerError();
  }

  const availablePlace = await res.findFreePlaceAsync(reservation, message.city, TABLE_NAME);
  if (!availablePlace) {
    return internalServerError();
  }

  if (_.isEmpty(availablePlace)) {
    const body = generateResponseBody(`No places available on ${message.dates} in ${message.city}`);
    return internalServerError(body);
  }

  const result = await res.saveReservationAsync(reservation.Id, availablePlace, message, TABLE_NAME);
  return result ? success(generateResponseBody(
    `You booked a place number ${availablePlace.Place} in ${message.city} on ${message.dates}`,
  )) : internalServerError();
};
