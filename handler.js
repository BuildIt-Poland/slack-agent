'use strict';

const auth = require('./security/authorization.js');
const parkingPlace = require('./workers/parkingPlace.js');
const slackMessages = require('./communication/slackMessages.js');
const res = require('./workers/reservation.js');

const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET,
	CLIENT_ID = process.env.SLACK_CLIENT_ID,
	CLIENT_SCOPES = process.env.SLACK_CLIENT_SCOPES,
	SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET,
	TABLE_NAME = process.env.TABLE_NAME,
	ENV_STAGE = process.env.ENV_STAGE;

module.exports.authorization = async (event) => {
	const params = {
		code: null,
		...event.queryStringParameters,
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		stage: ENV_STAGE
	};
	if (!params.code)
		return await auth.oAuthRedirectUrl({
			...event,
			scope: CLIENT_SCOPES,
			client_id: CLIENT_ID,
			stage: ENV_STAGE
		});
	await auth.authorize(params);
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Authorized',
			input: event,
		})
	};
};

module.exports.parkingPlace = async (event) => {
	const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
	if (!isValid) return {
		statusCode: 401
	};
	const { message, isValidCommand } = slackMessages.slackMessageValidate(event,{
		city: null,
		place: null
	});
	if(!isValidCommand)return {
		statusCode: 200,
		body: slackMessages.slackDefaultMessage(message)
	};
	const place = await parkingPlace.createPlace(message, TABLE_NAME);
	if (!place) return {
		statusCode: 400
	};
	const result = await parkingPlace.saveParkingPlace(place, TABLE_NAME);
	return result ? {
		statusCode: 200,
		body: slackMessages
			.slackDefaultMessage(`"You added a parking place.\n *City:* ${place.City}\n *Place:* ${place.Place}"`)
	} : {
		statusCode: 500
	};
};

module.exports.reservation = async (event) => {
	const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
	if(!isValid) return {
		statusCode: 200,
	};

	const {message, isValidCommand} = slackMessages.slackMessageValidate(event, {
		dates: null,
		city: null,
		userName: null,
	});
	if(!isValidCommand) return {
		statusCode: 200,
		body: slackMessages.slackDefaultMessage(message)
	};

	const reservation = await res.findReservationByDateAsync(message.dates, TABLE_NAME);
	if(!reservation) return {
		statusCode: 500
	};

	const place = await res.findFreePlaceAsync(reservation,message.city, TABLE_NAME);
	if(!place) return{
		statusCode: 500
	};
	if(!Object.keys(place).length) return {
		statusCode: 200,
		body: slackMessages
			.slackDefaultMessage(`No places available on ${message.dates} in ${message.city}`)
	};

	const result = await res.saveReservationAsync(reservation.Id, place, message, TABLE_NAME);
	return result ? {
		statusCode: 200,
		body: slackMessages
			.slackDefaultMessage(`You booked a place number ${place.Place} in ${message.city} on ${message.dates}`)
	} : {
		statusCode: 500
	};
};

module.exports.reservationList = async (event) => {
	const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
	if (!isValid) return {
		statusCode: 401
	};

	const {message, isValidCommand} = slackMessages.slackMessageValidate(event, {
		dates: null,
		city: null,
		userName: null
	});
	if(!isValidCommand) return {
		statusCode: 200,
		body: slackMessages.slackDefaultMessage(message)
	};
	


	const reservation = await res.findReservationByDateAsync(message.dates, TABLE_NAME);
	if(!reservation) return {
		statusCode: 500
	};

	const allPlaces = await res.listReservationsForDayAsync(reservation, message.city, TABLE_NAME);
	if(!allPlaces) return {
		statusCode: 500
	};
	if (!allPlaces.length) return {
		statusCode: 200,
		body: slackMessages.slackDefaultMessage(`Parking places don't exists`)
	};
	return {
		statusCode: 200,
		body: slackMessages.listSlackMessage(allPlaces, 'List of reservations with available places:')
	};
};