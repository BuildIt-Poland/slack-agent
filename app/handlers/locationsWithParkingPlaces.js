const { isVerified } = require('../services/authService.js');
const { getAllLocationsWithPlaces } = require('../dao/parkingPlace.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');
const { generateResponseBodyWithAttachments } = require('../utilities/responseBody.js');

module.exports.locations = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  const locationsWithPlaces = await getAllLocationsWithPlaces();

  return success(generateResponseBodyWithAttachments('Locations:', locationsWithPlaces));
};
