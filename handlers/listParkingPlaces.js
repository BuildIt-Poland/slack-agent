const auth = require('../security/authorization.js');
const res = require('../workers/reservation.js');
const { success, internalServerError, unauthorized } = require('../utility/reponseBuilder.js');
const { generateResponseBody, generateResponseBodyWithAttachments } = require('../utility/responseBody.js');
const { isCity, isFutureDate } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');

const { ENV_STAGE, SIGNING_SECRET, TABLE_NAME } = require('../config/all.js');

module.exports.reservationList = async event => {
  const isVerified = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isVerified) {
    return unauthorized();
  }

  const { message, isValidCommand } = parseBodyToObject(event, {
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
  if (!isValidCommand) {
    return success(generateResponseBody(message));
  }

  const reservation = await res.findReservationByDateAsync(message.dates, TABLE_NAME);
  if (!reservation) {
    return internalServerError();
  }

  const allPlaces = await res.listReservationsForDayAsync(reservation, message.city, TABLE_NAME);
  if (!allPlaces) {
    return internalServerError();
  }

  if (!allPlaces.length) {
    return success(generateResponseBody(`Parking places don't exists`));
  }

  return success(generateResponseBodyWithAttachments('List of reservations with available places:', allPlaces));
};
