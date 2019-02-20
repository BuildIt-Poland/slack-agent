const auth = require('../security/authorization.js');
const { isRequired, cityPattern } = require('../utility/request-parser-validations.js');
const { parseBodyToObject } = require('../utility/request-parser.js');
const { responseBody } = require('../utility/response.js');
const parkingPlace = require('../workers/parkingPlace.js');

const { SIGNING_SECRET, ENV_STAGE, TABLE_NAME } = require('../config/all.js');

module.exports.parkingPlace = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 401,
    };
  const { message, isValidCommand } = parseBodyToObject(event, {
    city: {
      required: city => isRequired(city),
      pattern: city => cityPattern(city),
    },
    place: {
      required: date => isRequired(date),
    },
  });

  if (!isValidCommand)
    return {
      statusCode: 200,
      body: responseBody(message),
    };

  const result = await parkingPlace.saveParkingPlace(message, TABLE_NAME);

  return result
    ? {
        statusCode: 200,
        body: responseBody(
          `You added a parking place.\n *City:* ${message.city}\n *Place:* ${message.place}`,
        ),
      }
    : {
        statusCode: 200,
        body: responseBody(`You can't add parking place`),
      };
};
