'use strict';

const queryString = require('query-string');

exports.parseMessageFromSlack = (payload, object) => {
	const params = queryString.parse(payload.body).text.split(' ');
	const keys = Object.keys(object);
	if(params.length !== keys.length && params.length === 0) 
		return null;
	return params.reduce((accumulator, currentValue, currentIndex) =>
		({...accumulator, [keys[currentIndex]]: currentValue}), {});
};

exports.slackDefaultMessage = (message) => {
	return `{"text": ${message}}`;
};

exports.listParkingPlaceSlackMessage = (places) => {
	if (!Array.isArray(places) || !places.length)
		return `{"text": "Parking places don't exists}`;
	const attachments = places.map(place =>  ({ text: `*City:* ${place.City}\n *Place:* ${place.Place}`}));
	return `{"text": "List of Parking Places:", "attachments" : ${JSON.stringify(attachments)}}`;
};