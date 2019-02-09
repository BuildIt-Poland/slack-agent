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
		City: placeParams.city,
		Place: placeParams.place,
	};
};

const placeExistInDynamo = async (place, tableName) => {
	const params = {
		ExpressionAttributeValues: {
			':place': `${place.place}`,
			':city': `${place.city}`
		},
		FilterExpression: 'Place = :place and City = :city',
		TableName: tableName
	};
	const result = await dynamo.scan(params);
	return !(result.Items.length === 0);
};