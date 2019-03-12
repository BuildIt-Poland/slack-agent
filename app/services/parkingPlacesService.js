const _ = require('lodash');

exports.mapParkingPlacesWithUser = (parkingPlaces, userName) =>
  _.map(parkingPlaces, ({ PlaceID }) => ({
    PlaceID,
    Owner: userName,
  }));

exports.getParkingPlacesForUser = (places, city, bookingDate, userName) =>
  _.reduce(
    places,
    (bookedParkingPlaces, { PlaceID, Owner }) =>
      Owner === userName
        ? [
            ...bookedParkingPlaces,
            {
              PlaceID,
              City: city,
              BookingDate: bookingDate,
            },
          ]
        : bookedParkingPlaces,
    [],
  );

exports.getParkingPlacesForBookings = (futureBookings, userName) =>
  _.reduce(
    futureBookings,
    (parkingPlaces, { Places, City, BookingDate }) => [
      ...parkingPlaces,
      ...this.getParkingPlacesForUser(Places, City, BookingDate, userName),
    ],
    [],
  );
