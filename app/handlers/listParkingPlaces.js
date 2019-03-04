const _ = require('lodash');
const { isVerified } = require('../services/authService.js');
const { getBooking } = require('../dao/bookings.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const {
  generateResponseBody,
  generateResponseBodyWithAttachments
} = require('../utilities/responseBody.js');
const { isCity, isFutureDate } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');

const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');

module.exports.list = async (event) => {
  if (!await isVerified(event, SIGNING_SECRET, ENV_STAGE)) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    bookingDate: {
      isFutureDate,
      required: (bookingDate) => !!bookingDate
    },
    city: {
      pattern: isCity,
      required: (bookingDate) => !!bookingDate
    },
    userName: {}
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  const { city, bookingDate } = message;
  const booking = await getBooking(bookingDate, city);

  if (_.isEmpty(booking)) {
    return success(generateResponseBody(`Parking places don't exists`));
  }

  return success(
    generateResponseBodyWithAttachments(
      'List of reservations with available places:',
      booking.Places
    )
  );
};
