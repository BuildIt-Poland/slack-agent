const _ = require('lodash');
const { query, save } = require('../services/dbService.js');

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

const createParkingPlacesWithOwner = async city => {
  return _.map(await getParkingPlaces(city), ({ PlaceID }) => ({
    PlaceID,
    Owner: 'free',
  }));
};

module.exports = {
  getParkingPlaces,
  addParkingPlace,
  createParkingPlacesWithOwner,
};
