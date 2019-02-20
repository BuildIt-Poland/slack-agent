const auth = require('../security/authorization.js');
const slackMessages = require('../communication/slackMessages.js');
const res = require('../workers/reservation.js');
const validations = require('../validations/validations.js');

const { ENV_STAGE, SIGNING_SECRET, TABLE_NAME } = require('../config/all.js');

module.exports.reservation = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 200,
    };

  const { message, isValidCommand } = slackMessages.slackMessageValidate(event, {
    dates: {
      customValidation: date => validations.dateMoreThanCurrent(date),
      required: date => validations.isRequired(date),
    },
    city: {
      pattern: city => validations.cityPattern(city),
      required: date => validations.isRequired(date),
    },
    userName: {},
  });
  if (!isValidCommand)
    return {
      statusCode: 200,
      body: slackMessages.slackDefaultMessage(message),
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
      body: slackMessages.slackDefaultMessage(
        `No places available on ${message.dates} in ${message.city}`,
      ),
    };

  const result = await res.saveReservationAsync(reservation.Id, place, message, TABLE_NAME);
  return result
    ? {
        statusCode: 200,
        body: slackMessages.slackDefaultMessage(
          `You booked a place number ${place.Place} in ${message.city} on ${message.dates}`,
        ),
      }
    : {
        statusCode: 500,
      };
};
