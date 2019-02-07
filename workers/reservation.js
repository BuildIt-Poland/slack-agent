'use strict';
const dynamo = require('../communication/dynamo.js');

exports.saveReservationAsync = async (reservationId, place, reservationParams, tableName) => {
	return !reservationId ? await putReservation(place, reservationParams, tableName) :
		await updateReservation(reservationId, place, reservationParams, tableName);
};

exports.findReservationByDateAsync = async (date, tableName) => {
	const params = {
		KeyConditionExpression: '#id = :dates and Types = :types',
		ExpressionAttributeNames:{
			'#id': 'Id'
		},
		ExpressionAttributeValues: {
			':dates': date,
			':types': 'reservation',
		},
		TableName: tableName
	};
	try {
		const result = await dynamo.query(params);
		return result.Items[0] || {};
	} catch (error) {
		console.log(error);
		return null;
	}
};
exports.findFreePlaceAsync = async (reservation, city, tableName) => {
	const places = await findPlacesInCityAsync(city, tableName);
	if(!places) return null;
	if(!places.length) return {};
	if (!Object.keys(reservation).length) return places[0];
	const freePlace = places.find((place) => !reservation.Reservations.some((item) => place.Id === item.Id));
	return freePlace ? freePlace : {};
};

exports.listReservationsForDayAsync = async (reservation, city, tableName) =>{
	const places = await findPlacesInCityAsync(city, tableName);
	if(!places) return null;
	if(!places.length) return [];
	if (!Object.keys(reservation).length) 
		return places.map(place => ({ City: place.City, Place: place.Place, Reservation: 'free'}));
	const allPlaces = places.map(place => {
		const res = reservation.Reservations.find((item) => place.Id === item.Id);
		return res ? {
			City: res.City,
			Place: res.Place,
			Reservation: res.Reservation || null
		} : {
			City: place.City,
			Place: place.Place,
			Reservation: 'free'
		};
	});
	return allPlaces;
};

async function putReservation(place, reservationParams, tableName) {
	try {
		await dynamo.save({
			Id: reservationParams.Dates,
			Types: 'reservation',
			Reservations: [{
				...place,
				Reservation: reservationParams.userName
			}]
		}, tableName);
	}
	catch (error) {
		console.error(error);
		return false;
	}
	return true;
}

async function updateReservation(reservationId, place, userName, tableName) {
	try {
		await dynamo.update({
			TableName: tableName,
			Key: { Id: reservationId,  Types: 'reservation' },
			UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
			ExpressionAttributeNames: { '#reservations': 'Reservations' },
			ExpressionAttributeValues: { ':place': [{
				...place,
				Reservation: userName
			}], }
		});
	}
	catch (error) {
		console.log(error);
		return false;
	}
	return true;
}

async function findPlacesInCityAsync(city, tableName) {
	const params = {
		ExpressionAttributeValues: {
			':city': city,
			':types': 'parkingPlace'
		},
		FilterExpression: 'City = :city and Types = :types',
		TableName: tableName
	};
	try {
		const result = await dynamo.scan(params);
		return result.Items;
	}
	catch(error){
		console.log(error);
		return null;
	}
}