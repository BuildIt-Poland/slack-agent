const { v4 } = require('uuid');
const _ = require('lodash');
const { save, scan } = require('../communication/dynamo.js');
const { error } = require('../communication/logger.js');

const isParkingPlace = async (userInputParams, tableName) => {
	try {
		const { Items } = await scan({
			ExpressionAttributeValues: {
				':place': `${userInputParams.place}`,
				':city': `${userInputParams.city}`
			},
			FilterExpression: 'Place = :place and City = :city',
			TableName: tableName
		});
		return _.isEmpty(Items);
	} catch (e) {
		error('reservation.isParkingPlace', e);
		return false;
	}
};

exports.saveParkingPlace = async (userInputParams, tableName) => {
	if (!await isParkingPlace(userInputParams, tableName)) return false;
	try {
		await save(
			{
				Id: v4(),
				City: userInputParams.city,
				Place: userInputParams.place
			},
			tableName
		);
		return true;
	} catch (e) {
		error('reservation.saveParkingPlace', e);
		return false;
	}
};
