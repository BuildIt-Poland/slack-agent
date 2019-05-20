const _ = require('lodash');
const { isVerified } = require('../services/authService.js');
const { getBooking, bookingExists } = require('../dao/bookings.js');
const { getParkingPlaces, cityExists } = require('../dao/parkingPlace.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const {
  generateResponseBody,
  generateResponseBodyWithAttachments,
} = require('../utilities/responseBody.js');
const { isCity } = require('../utilities/requestValidator.js');
const {
  getUserBookedParkingPlaces,
  decoratedParkingPlaces,
} = require('../services/parkingPlacesService.js');

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

  if (!(await cityExists(city))) {
    return success(generateResponseBody(`City ${city} doesn’t exist`))
  }

  let parkingPlaces;

  if (await bookingExists(date, city)) {
    const { Places } = await getBooking(date, city);
    parkingPlaces = getUserBookedParkingPlaces(Places, 'free');
  } else {
    const allParkingPlaces = await getParkingPlaces(city);
    parkingPlaces = decoratedParkingPlaces(allParkingPlaces, {});
  }

  if (_.isEmpty(parkingPlaces)) {
    return success(generateResponseBody(`All places booked`));
  }

  return success(generateResponseBodyWithAttachments('Available places:', parkingPlaces));
};
