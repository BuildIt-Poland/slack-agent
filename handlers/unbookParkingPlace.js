const auth = require('../security/authorization.js');
const { findReservationByDate, deleteReservationPlace } = require('../actions/bookings.js');
const { success, internalServerError, unauthorized } = require('../utilities/reponseBuilder.js');
const { isCity, isFutureDate } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { SIGNING_SECRET, ENV_STAGE, PARKING_PLACES_TABLE } = require('../config/all.js');

module.exports.deleteReservation = async (event) => {
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

  const reservation = await findReservationByDate(message.dates, PARKING_PLACES_TABLE);
  if (!reservation) {
    return internalServerError();
  }

  const placeDeleted = await deleteReservationPlace(reservation, message, PARKING_PLACES_TABLE);
  if (!placeDeleted) {
    return success(generateResponseBody(`You don't have reservation`));
  }

  return success(generateResponseBody(`Reservation deleted`));
};
