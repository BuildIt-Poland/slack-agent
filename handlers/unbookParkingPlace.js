const auth = require('../security/authorization.js');
const { isRequired, cityPattern, dateMoreThanCurrent } = require('../utility/request-parser-validations.js');
const { parseBodyToObject } = require('../utility/request-parser.js');
const { responseBody } = require('../utility/response.js');
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

  const placeDeleted = await res.deleteReservationPlace(reservation, message, TABLE_NAME);
  if (!placeDeleted)
    return {
      statusCode: 200,
      body: responseBody(`You don't have reservation`),
    };
  return {
    statusCode: 200,
    body: responseBody(`Reservation deleted`),
  };
};
