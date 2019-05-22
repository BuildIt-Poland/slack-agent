const _ = require('lodash');
const { isVerified } = require('../services/authService.js');
const { getBooking } = require('../dao/bookings.js');
const { getParkingPlaces } = require('../dao/parkingPlace.js');
const { decorateParkingPlaces } = require('../services/parkingPlacesService.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const {
  generateResponseBody,
  generateResponseBodyWithAttachments,
} = require('../utilities/responseBody.js');
const { isCity } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');

const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');

module.exports.places = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    dates: {
      required: dates => !_.isEmpty(dates),
    },
    city: {
      pattern: isCity,
      required: bookingDate => !!bookingDate,
    },
    userName: {},
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const { city, dates } = message;

  let { Places: parkingPlaces } = await getBooking(dates[0], city);

  if (_.isEmpty(parkingPlaces)) {
    const allParkingPlaces = await getParkingPlaces(city);
    parkingPlaces = decorateParkingPlaces(allParkingPlaces, { Owner: 'free' });
  }

  return success(
    generateResponseBodyWithAttachments(
      'List of reservations with available places:',
      parkingPlaces,
    ),
  );
};
