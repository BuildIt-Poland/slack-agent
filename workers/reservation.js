'use strict';
const dynamo = require('../communication/dynamo.js');

exports.saveReservation = async (reservation, reservationParams, tableName) => {
	const places = await findPlacesInCity(reservationParams.City, tableName);
	/*	return await dynamo.save({
			Types: 'reservation',
			Dates: reservationParams.Date,
			Reservations: [places[0]]
		}, tableName); */
	const freePlace = findFreePlace(reservation, places);
	const params = {
		TableName: tableName,
		Key: { id: reservation.Id },
		UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
		ExpressionAttributeNames: {'#reservations': 'Reservations'},
		ExpressionAttributeValues: { ':place': [freePlace],}
	};
	await dynamo.update(params);
	return null;
};

exports.findReservationByDate = async (date, tableName) => {
	const params = {
		ExpressionAttributeValues: {
			':types' : 'reservation',
			':dates': date
		},
		FilterExpression: 'Types = :types and Dates = :dates',
		TableName: tableName
	};
	const result = await dynamo.scan(params);
	return result.Items[0];
};

const findPlacesInCity = async (city, tableName) => {
	const params = {
		ExpressionAttributeValues: {
			':city' : city,
			':types' : 'parkingPlace'
		},
		FilterExpression: 'City = :city and Types = :types',
		TableName: tableName
	};
	const result = await dynamo.scan(params);
	return result.Items;
};

const findFreePlace = (reservation, places) => {
	return places.find((place) => !reservation.Reservations.some((item) => place.Id === item.Id));
};
