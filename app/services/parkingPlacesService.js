const { map, filter, flatten } = require('lodash');

const decorateParkingPlacesWithUser = (parkingPlaces, userName) =>
  map(parkingPlaces, ({ PlaceID }) => ({
    PlaceID,
    Owner: userName,
  }));

const getUserBookedParkingPlaces = (allParkingPlaces, userName, additionalProperties = {}) => {
  const userParkingPlaces = filter(allParkingPlaces, ({ Owner }) => Owner === userName);
  return map(userParkingPlaces, ({ PlaceID }) => ({
    PlaceID,
    ...additionalProperties,
  }));
};

const getUserParkingPlacesForBookings = (bookings, userName) =>
  flatten(
    map(bookings, ({ Places, City, BookingDate }) =>
      getUserBookedParkingPlaces(Places, userName, {
        City,
        BookingDate,
      }),
    ),
  );

module.exports = {
  decorateParkingPlacesWithUser,
  getUserBookedParkingPlaces,
  getUserParkingPlacesForBookings,
};
