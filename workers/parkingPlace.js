const dynamo = require('../communication/dynamo.js');

exports.saveParkingPlace = async (place, tableName) => {
	return await dynamo.save(place, tableName);
};

exports.createPlace = async (placeParams, tableName) => {
	if (!placeParams) return null;
	const isPlaceExist = await placeExistInDynamo(placeParams, tableName);
	return isPlaceExist ? null : {
		Types: 'parkingPlace',
		...placeParams
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