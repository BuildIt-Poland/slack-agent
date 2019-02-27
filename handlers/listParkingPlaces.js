const auth = require('../security/authorization.js');
const { findReservationByDate, listReservationsForDay } = require('../actions/bookings.js');
const { success, internalServerError, unauthorized } = require('../utilities/reponseBuilder.js');
const { generateResponseBody, generateResponseBodyWithAttachments } = require('../utilities/responseBody.js');
const { isCity, isFutureDate } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');

const { ENV_STAGE, SIGNING_SECRET } = require('../config/all.js');

module.exports.reservationList = async event => {
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

  const reservation = await findReservationByDate(message.dates);
  if (!reservation) {
    return internalServerError();
  }

  const allPlaces = await listReservationsForDay(reservation, message.city);
  if (!allPlaces) {
    return internalServerError();
  }

  if (!allPlaces.length) {
    return success(generateResponseBody(`Parking places don't exists`));
  }

  return success(generateResponseBodyWithAttachments('List of reservations with available places:', allPlaces));
};
