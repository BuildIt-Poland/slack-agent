const { save } = require('../services/dbService.js');
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
