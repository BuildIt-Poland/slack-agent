const { map, filter, flatten, isEmpty, findIndex } = require('lodash');

const decoratedParkingPlaces = (parkingPlaces, decoratedProperties) =>
  map(parkingPlaces, ({ PlaceID }) => ({
    PlaceID,
    ...decoratedProperties,
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

const changeParkingPlaceOwner = (parkingPlaces, owner, placeId = null) => {
  if (isEmpty(parkingPlaces)) {
    return [];
  }

  if (placeId) {
    return map(parkingPlaces, parkingPlace => ({
      ...parkingPlace,
      Owner: parkingPlace.PlaceID === placeId ? owner : 'free',
    }));
  }

  const parkingPlacesCopy = [...parkingPlaces];

  parkingPlacesCopy[0] = { ...parkingPlacesCopy[0], Owner: owner };

  return parkingPlacesCopy;
};

const findParkingPlaceIndex = (parkingPlaces, currentOwner, placeId = null) => {
  const findClause = { Owner: currentOwner };

  if (placeId) {
    findClause.PlaceID = placeId;
  }

  return findIndex(parkingPlaces, findClause);
};

module.exports = {
  decoratedParkingPlaces,
  getUserBookedParkingPlaces,
  getUserParkingPlacesForBookings,
  changeParkingPlaceOwner,
  findParkingPlaceIndex,
};
