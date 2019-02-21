const auth = require('../security/authorization.js');
const { isCity } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody } = require('../utility/responseBody.js');
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
      required: city => !!city,
      pattern: city => isCity(city),
    },
    place: {
      required: date => !!date
    },
  });

  if (!isValidCommand)
    return {
      statusCode: 200,
      body: generateResponseBody(message),
    };

  const result = await parkingPlace.saveParkingPlace(message, TABLE_NAME);

  return result
    ? {
        statusCode: 200,
        body: generateResponseBody(
          `You added a parking place.\n *City:* ${message.city}\n *Place:* ${message.place}`,
        ),
      }
    : {
        statusCode: 200,
        body: generateResponseBody(`You can't add parking place`),
      };
};
