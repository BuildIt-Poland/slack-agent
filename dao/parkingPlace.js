const { query, save } = require('../services/dbService.js');
const { error } = require('../services/loggerService.js');

const { PARKING_PLACES_TABLE } = require('../config/all');

exports.addParkingPlace = async (userInputParams) => {
  try {
    await save(
      {
        City: userInputParams.city,
        PlaceID: userInputParams.placeId
      },
      PARKING_PLACES_TABLE
    );
    return true;
  } catch (e) {
    error('reservation.addParkingPlace', e);
    return false;
  }
};

exports.getParkingPlaces = async (city) => {
  const params = {
    KeyConditionExpression: 'City=:city',
    ExpressionAttributeValues: {
      ':city': city,
    },
  };

  const { Items } = await query(params, PARKING_PLACES_TABLE);
  return Items;
}
