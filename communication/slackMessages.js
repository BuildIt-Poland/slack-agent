'use strict';

const queryString = require('query-string');

exports.slackMessageValidate = (payload, object) => {
	const parsedObject = parseMessageFromSlack(payload, object);
	const isValid = !Object.keys(parsedObject).some(key => 
		(parsedObject[key] === undefined || parsedObject[key] === ''));	
	return isValid ? {
		isValid: isValid,
		message: parsedObject
	} : {
		isValid: isValid,
		message: 'Invalid command'
	};
};

function parseMessageFromSlack(payload, object) {
	const bodyParams = queryString.parse(payload.body);
	const textParams = bodyParams.text.split(' ');
	const keys = Object.keys(object);
	const parsedTextMessage =  keys.reduce((acc, key, index) => 
		({...acc, [key]: textParams[index]}), {});
	return object.hasOwnProperty('userName') ? 
		{
			...parsedTextMessage,
			userName: bodyParams.user_name
		} : parsedTextMessage;
}

exports.slackDefaultMessage = (message) => {
	return `{"text": "${message}"}`;
};

exports.listSlackMessage = (records, title) => {
	const attachments = records.map(record => {
		const textArray = Object.keys(record)
			.map(key => (record[key] || record[key] != '') 
				? `*${key}:* ${record[key]}\n` : '');
		return { text: textArray.join('') };
	});
	return `{"text": "${title}", "attachments" : ${JSON.stringify(attachments)}}`;
};