const { every, some } = require('lodash');

const isBookingAvailableForAnyPlace = bookings =>
  every(bookings, ({ Places }) => some(Places, ({ Owner }) => Owner === 'free'));

const isBookingAvailableForSpecificPlace = (bookings, placeId) =>
  every(bookings, ({ Places }) =>
    some(Places, ({ Owner, PlaceID }) => Owner === 'free' && PlaceID === placeId),
  );

module.exports = {
  isBookingAvailableForAnyPlace,
  isBookingAvailableForSpecificPlace,
};
