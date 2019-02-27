const auth = require('../security/authorization.js');
const { addParkingPlace } = require('../dao/parkingPlace.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { isCity } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { SIGNING_SECRET, ENV_STAGE } = require('../config/all.js');

module.exports.add = async (event) => {
  const isVerified = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isVerified) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    city: {
      required: (city) => !!city,
      pattern: isCity
    },
    placeId: {
      required: (date) => !!date
    }
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const result = await addParkingPlace(message);

  if (result) {
    return success(
      generateResponseBody(
        `You added a parking place.\n *City:* ${message.city}\n *Place:* ${message.placeId}`
      )
    );
  }

  return success(generateResponseBody(`You can't add parking place`));
};
