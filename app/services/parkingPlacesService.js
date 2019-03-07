const _ = require('lodash');

const mapParkingPlacesForUser = (places, city, bookingDate, userName) =>
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

exports.userParkingPlaces = (userName, futureBookings) =>
  _.reduce(
    futureBookings,
    (parkingPlaces, { Places, City, BookingDate }) => [
      ...parkingPlaces,
      ...mapParkingPlacesForUser(Places, City, BookingDate, userName),
    ],
    [],
  );
