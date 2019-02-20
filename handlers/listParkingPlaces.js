const auth = require('../security/authorization.js');
const slackMessages = require('../communication/slackMessages.js');
const res = require('../workers/reservation.js');
const validations = require('../validations/validations.js');

const { ENV_STAGE, SIGNING_SECRET, TABLE_NAME } = require('../config/all.js');

module.exports.reservationList = async event => {
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

  const allPlaces = await res.listReservationsForDayAsync(reservation, message.city, TABLE_NAME);
  if (!allPlaces)
    return {
      statusCode: 500,
    };
  if (!allPlaces.length)
    return {
      statusCode: 200,
      body: slackMessages.slackDefaultMessage(`Parking places don't exists`),
    };
  return {
    statusCode: 200,
    body: slackMessages.listSlackMessage(allPlaces, 'List of reservations with available places:'),
  };
};
