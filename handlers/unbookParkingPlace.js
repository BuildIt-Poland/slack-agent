const auth = require('../security/authorization.js');
const res = require('../workers/reservation.js');
const { success, internalServerError, unauthorized } = require('../utility/reponseBuilder.js');
const { isCity, isFutureDate } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody } = require('../utility/responseBody.js');

const { SIGNING_SECRET, ENV_STAGE, TABLE_NAME } = require('../config/all.js');

module.exports.deleteReservation = async event => {
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

  const placeDeleted = await res.deleteReservationPlace(reservation, message, TABLE_NAME);
  if (!placeDeleted) {
    return success(generateResponseBody(`You don't have reservation`));
  }

  return success(generateResponseBody(`Reservation deleted`));
};
