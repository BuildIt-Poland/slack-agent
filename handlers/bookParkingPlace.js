const auth = require('../security/authorization.js');
const { isCity, isFeatureDate } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody } = require('../utility/responseBody.js');
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
      isFeatureDate: date => isFeatureDate(date),
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

  const place = await res.findFreePlaceAsync(reservation, message.city, TABLE_NAME);
  if (!place)
    return {
      statusCode: 500,
    };
  if (!Object.keys(place).length)
    return {
      statusCode: 200,
      body: generateResponseBody(
        `No places available on ${message.dates} in ${message.city}`,
      ),
    };

  const result = await res.saveReservationAsync(reservation.Id, place, message, TABLE_NAME);
  return result
    ? {
        statusCode: 200,
        body: generateResponseBody(
          `You booked a place number ${place.Place} in ${message.city} on ${message.dates}`,
        ),
      }
    : {
        statusCode: 500,
      };
};
