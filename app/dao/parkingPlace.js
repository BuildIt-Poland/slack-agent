const { isEmpty } = require('lodash');
const { query, save, scan } = require('../services/dbService.js');

const { PARKING_PLACES_TABLE } = require('../../config/all');

const addParkingPlace = async userInputParams => {
  return save(
    {
      City: userInputParams.city,
      PlaceID: userInputParams.placeId,
    },
    PARKING_PLACES_TABLE,
  );
};

const getParkingPlaces = async city => {
  const params = {
    KeyConditionExpression: 'City=:city',
    ExpressionAttributeValues: {
      ':city': city,
    },
  };

  const { Items } = await query(params, PARKING_PLACES_TABLE);
  return Items;
};

const getAllLocationsWithPlaces = async () => {
  const { Items } = await scan({}, PARKING_PLACES_TABLE);

  return Items;
}

const parkingPlaceExists = async (placeId, city) => {
  const params = {
    KeyConditionExpression: 'City=:city and PlaceID=:placeId',
    ExpressionAttributeValues: {
      ':city': city,
      ':placeId': placeId,
    },
  };

  const { Items } = await query(params, PARKING_PLACES_TABLE);

  return !isEmpty(Items);
};

const cityExists = async city => !isEmpty(await getParkingPlaces(city));

module.exports = {
  cityExists,
  parkingPlaceExists,
  getParkingPlaces,
  getAllLocationsWithPlaces,
  addParkingPlace,
};
