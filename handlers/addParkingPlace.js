const auth = require('../security/authorization.js');
const slackMessages = require('../communication/slackMessages.js');
const parkingPlace = require('../workers/parkingPlace.js');
const validations = require('../validations/validations.js');

const { SIGNING_SECRET, ENV_STAGE, TABLE_NAME } = require('../config/all.js');

module.exports.parkingPlace = async event => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isValid)
    return {
      statusCode: 401,
    };
  const { message, isValidCommand } = slackMessages.slackMessageValidate(event, {
    city: {
      required: city => validations.isRequired(city),
      pattern: city => validations.cityPattern(city),
    },
    place: {
      required: date => validations.isRequired(date),
    },
  });

  if (!isValidCommand)
    return {
      statusCode: 200,
      body: slackMessages.slackDefaultMessage(message),
    };

  const result = await parkingPlace.saveParkingPlace(message, TABLE_NAME);

  return result
    ? {
        statusCode: 200,
        body: slackMessages.slackDefaultMessage(
          `You added a parking place.\n *City:* ${message.city}\n *Place:* ${message.place}`,
        ),
      }
    : {
        statusCode: 200,
        body: slackMessages.slackDefaultMessage(`You can't add parking place`),
      };
};
