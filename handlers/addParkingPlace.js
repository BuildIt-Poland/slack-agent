const auth = require('../security/authorization.js');
const parkingPlace = require('../workers/parkingPlace.js');
const { success, unauthorized } = require('../utility/reponseBuilder.js');
const { isCity } = require('../utility/requestValidator.js');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { generateResponseBody } = require('../utility/responseBody.js');

const { SIGNING_SECRET, ENV_STAGE, TABLE_NAME } = require('../config/all.js');

module.exports.parkingPlace = async event => {
  const isVerified = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
  if (!isVerified) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    city: {
      required: city => !!city,
      pattern: isCity,
    },
    place: {
      required: date => !!date
    },
  });

  if (!isValid){
    return success(generateResponseBody(message));
  }

  const result = await parkingPlace.saveParkingPlace(message, TABLE_NAME);

  if(result) {
    return success(generateResponseBody(
      `You added a parking place.\n *City:* ${message.city}\n *Place:* ${message.place}`,
    ));
  }

  return success(generateResponseBody(`You can't add parking place`));
};
