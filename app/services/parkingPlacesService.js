const _ = require('lodash');

exports.mapParkingPlacesForUser = (places, city, bookingDate, userName) =>
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

exports.getUserParkingPlaces = (userName, futureBookings) =>
  _.reduce(
    futureBookings,
    (parkingPlaces, { Places, City, BookingDate }) => [
      ...parkingPlaces,
      ...this.mapParkingPlacesForUser(Places, City, BookingDate, userName),
    ],
    [],
  );
