const auth = require('../security/authorization.js');
const { isRequired, cityPattern, dateMoreThanCurrent } = require('../utility/request-parser-validations.js');
const { parseBodyToObject } = require('../utility/request-parser.js');
const { responseBody } = require('../utility/response.js');
const res = require('../workers/reservation.js');

const { ENV_STAGE, SIGNING_SECRET, TABLE_NAME } = require('../config/all.js');

module.exports.reservation = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 200,
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

  const place = await res.findFreePlaceAsync(reservation, message.city, TABLE_NAME);
  if (!place)
    return {
      statusCode: 500,
    };
  if (!Object.keys(place).length)
    return {
      statusCode: 200,
      body: responseBody(
        `No places available on ${message.dates} in ${message.city}`,
      ),
    };

  const result = await res.saveReservationAsync(reservation.Id, place, message, TABLE_NAME);
  return result
    ? {
        statusCode: 200,
        body: responseBody(
          `You booked a place number ${place.Place} in ${message.city} on ${message.dates}`,
        ),
      }
    : {
        statusCode: 500,
      };
};
