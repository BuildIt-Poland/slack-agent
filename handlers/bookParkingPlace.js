const _ = require('lodash');
const auth = require('../security/authorization.js');
const {
  findReservationByDate,
  findFreePlace,
  saveReservation
} = require('../actions/bookings.js');

const { success, internalServerError, unauthorized } = require('../utilities/reponseBuilder.js');
const { isCity, isFutureDate } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { ENV_STAGE, SIGNING_SECRET } = require('../config/all.js');

module.exports.book = async (event) => {
  const isVerified = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isVerified) {
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

  const reservation = await findReservationByDate(message.dates);
  if (!reservation) {
    return internalServerError();
  }

  const availablePlace = await findFreePlace(reservation, message.city);
  if (!availablePlace) {
    return internalServerError();
  }

  if (_.isEmpty(availablePlace)) {
    const body = generateResponseBody(`No places available on ${message.dates} in ${message.city}`);
    return internalServerError(body);
  }

  const result = await saveReservation(reservation.Id, availablePlace, message);
  return result
    ? success(
        generateResponseBody(
          `You booked a place number ${availablePlace.Place} in ${message.city} on ${message.dates}`
        )
      )
    : internalServerError();
};
