'use strict';
const dynamo = require('../communication/dynamo.js');

exports.saveReservation = async (reservation, reservationParams, tableName) => {
	const places = await findPlacesInCity(reservationParams.City, tableName);
	if(!reservation){
		return await dynamo.save({
			Types: 'reservation',
			dates: reservationParams.Date,
			reservations: [places.first()]
		}, tableName); 
	} else{
		//TOO DO
		return null;
	}
};

exports.findReservationByDate = async (date, tableName) => {
	const params = {
		ExpressionAttributeValues: {
			':dates' : date,
			':types' : 'reservation'
		},
		FilterExpression: 'Dates = :dates and Types = :types',
		TableName: tableName
	};
	const result = await dynamo.scan(params);
	return result.Items;
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

/*const findFreePlace = async (reservation, places) => {
	return places.find((place) => !reservation.reservations.some((reservation) => place.City === reservation.City && place.Place === reservation.place));
};*/