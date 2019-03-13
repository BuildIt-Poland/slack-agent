const _ = require('lodash');
const { isVerified } = require('../services/authService.js');
const { getBooking } = require('../dao/bookings.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const {
  generateResponseBody,
  generateResponseBodyWithAttachments,
} = require('../utilities/responseBody.js');
const { isCity } = require('../utilities/requestValidator.js');
const { getUserBookedParkingPlaces } = require('../services/parkingPlacesService.js');

module.exports.free = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    dates: {
      required: date => !_.isEmpty(date),
    },
    city: {
      pattern: isCity,
      required: date => !!date,
    },
    userName: {},
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }
  const {
    dates: [date],
    city,
  } = message;

  const { Places } = await getBooking(date, city);

  const parkingPlaces = getUserBookedParkingPlaces(Places, 'free');

  if (_.isEmpty(parkingPlaces)) {
    return success(generateResponseBody(`We don't have available places`));
  }
  return success(generateResponseBodyWithAttachments('Available places:', parkingPlaces));
};
