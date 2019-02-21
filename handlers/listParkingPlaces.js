const auth = require('../security/authorization.js');
const { isCity, isFutureDate } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody, generateResponseBodyWithAttachments } = require('../utility/responseBody.js');
const res = require('../workers/reservation.js');

const { ENV_STAGE, SIGNING_SECRET, TABLE_NAME } = require('../config/all.js');

module.exports.reservationList = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 401,
    };

  const { message, isValidCommand } = parseBodyToObject(event, {
    dates: {
      isFutureDate: date => isFutureDate(date),
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

  const allPlaces = await res.listReservationsForDayAsync(reservation, message.city, TABLE_NAME);
  if (!allPlaces)
    return {
      statusCode: 500,
    };
  if (!allPlaces.length)
    return {
      statusCode: 200,
      body: generateResponseBody(`Parking places don't exists`),
    };
  return {
    statusCode: 200,
    body: generateResponseBodyWithAttachments('List of reservations with available places:', allPlaces),
  };
};
