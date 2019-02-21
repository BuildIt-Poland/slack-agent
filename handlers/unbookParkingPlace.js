const auth = require('../security/authorization.js');
const { isCity, isFutureDate } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody } = require('../utility/responseBody.js');
const res = require('../workers/reservation.js');

const { SIGNING_SECRET, ENV_STAGE, TABLE_NAME } = require('../config/all.js');

module.exports.deleteReservation = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 401,
    };

  const { message, isValidCommand } = parseBodyToObject(event, {
    dates: {
      isFutureDates: date => isFutureDate(date),
      required: date => !!date,
    },
    city: {
      pattern: city => isCity(city),
      required: date => !!date,
    },
    userName: {},
  });

  if (!isValidCommand)
    return {
      statusCode: 200,
      body: generateResponseBody(message),
    };

  const reservation = await res.findReservationByDateAsync(message.dates, TABLE_NAME);
  if (!reservation)
    return {
      statusCode: 500,
    };

  const placeDeleted = await res.deleteReservationPlace(reservation, message, TABLE_NAME);
  if (!placeDeleted)
    return {
      statusCode: 200,
      body: generateResponseBody(`You don't have reservation`),
    };
  return {
    statusCode: 200,
    body: generateResponseBody(`Reservation deleted`),
  };
};
