'use strict';
const dynamo = require('../communication/dynamo.js');
const log = require('../communication/logger.js');

exports.saveReservationAsync = async (reservationId, place, reservationParams, tableName) => {
	return !reservationId ? await putReservation(place, reservationParams, tableName) :
		await updateReservation(reservationId, place, reservationParams.userName, tableName);
};

exports.findReservationByDateAsync = async (date, tableName) => {
	const params = {
		KeyConditionExpression: '#id = :dates and City = :city',
		ExpressionAttributeNames:{
			'#id': 'Id'
		},
		ExpressionAttributeValues: {
			':dates': date,
			':city': 'multiple',
		},
		TableName: tableName
	};
	try {
		const result = await dynamo.query(params);
		return result.Items[0] || {};
	} catch (error) {
		log.error('reservation.findReservationByDateAsync', error);
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

exports.deleteReservationPlace = async (reservation, reservationParams, tableName) => {
	const place = findPlaceReservation(reservation, reservationParams);
	try {
		await dynamo.update({
			TableName: tableName,
			Key: { Id: reservation.Id,  City: 'multiple' },
			UpdateExpression: `REMOVE List[${place}]`,
		});
	} catch (error) {
		log.error('reservation.deleteReservation', error);
		return false;
	}
	return true;
};

function findPlaceReservation(reservation, reservationParams) {
	const place = reservation.Reservations
		.find((place) => place.Reservation === reservationParams.userName && place.City === reservationParams.City);
	return place;
}

async function putReservation(place, reservationParams, tableName) {
	try {
		await dynamo.save({
			Id: reservationParams.dates,
			City: 'multiple',
			Reservations: [{
				...place,
				Reservation: reservationParams.userName
			}]
		}, tableName);
	}
	catch (error) {
		log.error('reservation.putReservation', error);
		return false;
	}
	return true;
}

async function updateReservation(reservationId, place, userName, tableName) {
	try {
		await dynamo.update({
			TableName: tableName,
			Key: { Id: reservationId,  City: 'multiple' },
			UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
			ExpressionAttributeNames: { '#reservations': 'Reservations' },
			ExpressionAttributeValues: { ':place': [{
				...place,
				Reservation: userName
			}], }
		});
	}
	catch (error) {
		log.error('reservation.updateReservation', error);
		return false;
	}
	return true;
}

async function findPlacesInCityAsync(city, tableName) {
	const params = {
		KeyConditionExpression: 'City = :city',
		ExpressionAttributeValues: {
			':city': city,
		},
		TableName: tableName,
		IndexName: 'city-index'
	};
	try {
		const result = await dynamo.query(params);
		return result.Items;
	}
	catch(error){
		log.error('reservation.findPlacesInCityAsync', error);
		return null;
	}
}