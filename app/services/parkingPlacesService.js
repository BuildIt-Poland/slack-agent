const { map, filter, flatten, isEmpty, findIndex } = require('lodash');

const decorateParkingPlaces = (parkingPlaces, decorateProperties) =>
  map(parkingPlaces, ({ PlaceID }) => ({
    PlaceID,
    ...decorateProperties,
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
  const parkingPlacesCopy = [...parkingPlaces];
  if (isEmpty(parkingPlacesCopy)) {
    return [];
  }
  if (placeId) {
    return map(parkingPlacesCopy, parkingPlace => ({
      ...parkingPlace,
      Owner: parkingPlace.PlaceID === placeId ? owner : 'free',
    }));
  }
  parkingPlacesCopy[0].Owner = owner;
  return parkingPlacesCopy;
};

const findParkingPlaceIndex = (parkingPlaces, currentOwner, placeId = null) =>
  placeId
    ? findIndex(parkingPlaces, { Owner: currentOwner, PlaceID: placeId })
    : findIndex(parkingPlaces, { Owner: currentOwner });

module.exports = {
  decorateParkingPlaces,
  getUserBookedParkingPlaces,
  getUserParkingPlacesForBookings,
  changeParkingPlaceOwner,
  findParkingPlaceIndex,
};
