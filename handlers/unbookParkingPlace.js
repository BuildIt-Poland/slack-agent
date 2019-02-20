const auth = require('../security/authorization.js');
const slackMessages = require('../communication/slackMessages.js');
const res = require('../workers/reservation.js');
const validations = require('../validations/validations.js');

const { SIGNING_SECRET, ENV_STAGE, TABLE_NAME } = require('../config/all.js');

module.exports.deleteReservation = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 401,
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

  const placeDeleted = await res.deleteReservationPlace(reservation, message, TABLE_NAME);
  if (!placeDeleted)
    return {
      statusCode: 200,
      body: slackMessages.slackDefaultMessage(`You don't have reservation`),
    };
  return {
    statusCode: 200,
    body: slackMessages.slackDefaultMessage(`Reservation deleted`),
  };
};
