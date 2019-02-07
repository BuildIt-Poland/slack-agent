const dynamo = require('../communication/dynamo.js');
const uuid = require('uuid');

exports.saveParkingPlace = async (place, tableName) => {
	return await dynamo.save(place, tableName);
};

exports.createPlace = async (placeParams, tableName) => {
	if (!placeParams) return null;
	const isPlaceExist = await placeExistInDynamo(placeParams, tableName);
	return isPlaceExist ? null : {
		Id: uuid.v4(),
		Types: 'parkingPlace',
		City: placeParams.City,
		Place: placeParams.Place
	};
};

const placeExistInDynamo = async (place, tableName) => {
	const params = {
		ExpressionAttributeValues: {
			':place': `${place.Place}`,
			':city': `${place.City}`
		},
		FilterExpression: 'Place = :place and City = :city',
		TableName: tableName
	};
	const result = await dynamo.scan(params);
	return !(result.Items.length === 0);
};