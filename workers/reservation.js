'use strict';
const dynamo = require('../communication/dynamo.js');
exports.saveReservationAsync = async (reservation, place, reservationParams, tableName) => {
	return !reservation ? await dynamo.save({
		Types: 'reservation',
		Dates: reservationParams.Dates,
		Reservations: [place]
	}, tableName) : await dynamo.update({
		TableName: tableName,
		Key: { Id: reservation.Id },
		UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
		ExpressionAttributeNames: {'#reservations': 'Reservations'},
		ExpressionAttributeValues: { ':place': [place],}
	}); 
};

exports.findReservationByDateAsync = async (date, tableName) => {
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

async function findPlacesInCityAsync(city, tableName){
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
}

exports.findFreePlaceAsync = async (reservation, reservationParams, tableName) => {
	const places = await findPlacesInCityAsync(reservationParams.City, tableName);
	if(!places.length) return null;
	if(!reservation) return places[0];
	const freePlace = places.find((place) => !reservation.Reservations.some((item) => place.Id === item.Id));
	return freePlace ? freePlace : null;
};