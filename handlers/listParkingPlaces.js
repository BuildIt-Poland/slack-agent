const auth = require('../security/authorization.js');
const { isRequired, cityPattern, dateMoreThanCurrent } = require('../utility/request-parser-validations.js');
const { parseBodyToObject } = require('../utility/request-parser.js');
const { responseBody, responseBodyWithAttachments } = require('../utility/response.js');
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
      customValidation: date => dateMoreThanCurrent(date),
      required: date => isRequired(date),
    },
    city: {
      pattern: city => cityPattern(city),
      required: date => isRequired(date),
    },
    userName: {},
  });
  if (!isValidCommand)
    return {
      statusCode: 200,
      body: responseBody(message),
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
      body: responseBody(`Parking places don't exists`),
    };
  return {
    statusCode: 200,
    body: responseBodyWithAttachments('List of reservations with available places:', allPlaces),
  };
};
