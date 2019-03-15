const { every, some } = require('lodash');

const isBookingAvailableForAnyPlaces = bookings =>
  every(bookings, booking => some(booking.Places, placeBooking => placeBooking.Owner === 'free'));

const isBookingAvailableForSpecyficPlaces = (bookings, placeId) =>
  every(bookings, booking =>
    some(
      booking.Places,
      placeBooking => placeBooking.Owner === 'free' && placeBooking.PlaceID === placeId,
    ),
  );

module.exports = {
  isBookingAvailableForAnyPlaces,
  isBookingAvailableForSpecyficPlaces,
};
