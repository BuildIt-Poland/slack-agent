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
	const placeParams = slackMessages.parseMessageFromSlack(event,{
		City: null,
		Place: null
	});
	const place = await parkingPlace.createPlace(placeParams, TABLE_NAME);
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

module.exports.parkingPlaceList = async (event) => {
	const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
	if (!isValid) return {
		statusCode: 401
	};
	const result = await parkingPlace.getParkingPlaces(TABLE_NAME);
	return {
		statusCode: 200,
		body: slackMessages.listParkingPlaceSlackMessage(result.Items)
	};
};

module.exports.reservation = async (event) => {
	const isValid = await auth.isVerified(event, SIGNING_SECRET, ENV_STAGE);
	if(!isValid) return {
		statusCode: 200,
	};
	const reservationParams = slackMessages.parseMessageFromSlack(event, {
		Dates: null,
		City: null,
	});

	const reservation = await res.findReservationByDateAsync(reservationParams.Dates, TABLE_NAME);

	const place = await res.findFreePlaceAsync(reservation,reservationParams, TABLE_NAME);
	if(!place) return {
		statusCode: 200,
		body: slackMessages
			.slackDefaultMessage(`No places available on ${reservationParams.Dates} in ${reservationParams.City}`)
	};
	
	const result = await res.saveReservationAsync(reservation, place, reservationParams, TABLE_NAME);

	return result ? {
		statusCode: 200,
		body: slackMessages
			.slackDefaultMessage(`You booked a place number ${place.Place} in ${reservationParams.City} on ${reservationParams.Dates}`)
	} : {
		statusCode: 500
	};
};