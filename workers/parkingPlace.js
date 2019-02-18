const dynamo = require('../communication/dynamo.js');
const uuid = require('uuid');
const log = require('../communication/logger.js');

exports.saveParkingPlace = async (placeParams, tableName) => {
	const isPlaceExist = await isParkingPlaceExists(placeParams, tableName);
	if(isPlaceExist){
		return false;
	}
	try {
		await dynamo.save({
			Id: uuid.v4(),
			City: placeParams.city,
			Place: placeParams.place,
		}, tableName);
	}
	catch (error) {
		log.error('reservation.saveParkingPlace', error);
		return false;
	}
	return true;
};

async function isParkingPlaceExists(place, tableName) {
	const params = {
		ExpressionAttributeValues: {
			':place': `${place.place}`,
			':city': `${place.city}`
		},
		FilterExpression: 'Place = :place and City = :city',
		TableName: tableName
	};
	try {
		const result = await dynamo.scan(params);
		return !(result.Items.length === 0);
	}
	catch(error){
		log.error('reservation.isParkingPlaceExists', error);
		return true;
	}
}