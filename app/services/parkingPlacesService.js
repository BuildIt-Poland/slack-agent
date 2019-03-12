const _ = require('lodash');

exports.mapParkingPlacesWithUser = (parkingPlaces, userName) =>
  _.map(parkingPlaces, ({ PlaceID }) => ({
    PlaceID,
    Owner: userName,
  }));

exports.getParkingPlacesForUser = (places, userName, additionalProperties = {}) => {
  return _.reduce(
    places,
    (bookedParkingPlaces, { PlaceID, Owner }) =>
      Owner === userName
        ? [
            ...bookedParkingPlaces,
            {
              PlaceID,
              ...additionalProperties,
            },
          ]
        : bookedParkingPlaces,
    [],
  );
};

exports.getParkingPlacesForBookings = (futureBookings, userName) =>
  _.reduce(
    futureBookings,
    (parkingPlaces, { Places, City, BookingDate }) => [
      ...parkingPlaces,
      ...this.getParkingPlacesForUser(Places, userName, {
        City,
        BookingDate,
      }),
    ],
    [],
  );
