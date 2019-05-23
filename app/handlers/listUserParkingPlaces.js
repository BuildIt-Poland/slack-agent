const { isVerified } = require('../services/authService.js');
const { getFutureBookings } = require('../dao/bookings.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const {
  generateResponseBody,
  generateResponseBodyWithAttachments,
} = require('../utilities/responseBody.js');
const { getUserParkingPlacesForBookings } = require('../services/parkingPlacesService.js');

const { MY_RESERVATIONS } = require('../utilities/responseMessages.js');

module.exports.my = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    userName: {},
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const futureBookings = await getFutureBookings();

  const parkingPlaces = getUserParkingPlacesForBookings(futureBookings, message.userName);

  return success(generateResponseBodyWithAttachments(MY_RESERVATIONS, parkingPlaces));
};
