const { v4 } = require('uuid');
const _ = require('lodash');
const { save, scan } = require('../services/daoService.js');
const { error } = require('../services/loggerService.js');

const { PARKING_PLACES_TABLE } = require('../config/all');

const isParkingPlace = async userInputParams => {
  try {
    const { Items } = await scan({
      ExpressionAttributeValues: {
        ':place': `${userInputParams.place}`,
        ':city': `${userInputParams.city}`,
      },
      FilterExpression: 'Place = :place and City = :city',
    }, PARKING_PLACES_TABLE);
    return _.isEmpty(Items);
  } catch (e) {
    error('reservation.isParkingPlace', e);
    return false;
  }
};

exports.saveParkingPlace = async userInputParams => {
  if (!(await isParkingPlace(userInputParams))) return false;
  try {
    await save({
      Id: v4(),
      City: userInputParams.city,
      Place: userInputParams.place,
    }, PARKING_PLACES_TABLE);
    return true;
  } catch (e) {
    error('reservation.saveParkingPlace', e);
    return false;
  }
};
