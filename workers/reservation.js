'use strict';
const dynamo = require('../communication/dynamo.js');

exports.saveReservation = async (reservation, reservationParams, tableName) => {
	const places = await findPlacesInCity(reservationParams.City, tableName);
	if(!places.length) return null;
	if(!reservation) return await dynamo.save({
		Types: 'reservation',
		ReturnValues: 'ALL_NEW',
		Dates: reservationParams.Date,
		Reservations: [places[0]]
	}, tableName); 
	const freePlace = findFreePlace(reservation, places);
	return freePlace ? await dynamo.update({
		TableName: tableName,
		Key: { id: reservation.Id },
		ReturnValues: 'ALL_NEW',
		UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
		ExpressionAttributeNames: {'#reservations': 'Reservations'},
		ExpressionAttributeValues: { ':place': [freePlace],}
	}) : null;
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
