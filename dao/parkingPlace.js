const { query, save } = require('../services/dbService.js');

const { PARKING_PLACES_TABLE } = require('../config/all');

exports.addParkingPlace = async (userInputParams) => {
  return save(
    {
      City: userInputParams.city,
      PlaceID: userInputParams.placeId
    },
    PARKING_PLACES_TABLE
  );
};

exports.getParkingPlaces = async (city) => {
  const params = {
    KeyConditionExpression: 'City=:city',
    ExpressionAttributeValues: {
      ':city': city
    }
  };

  const { Items } = await query(params, PARKING_PLACES_TABLE);
  return Items;
};
