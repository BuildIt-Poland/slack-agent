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

exports.listSlackMessage = (records, title) => {
	const attachments = records.map(record => {
		const textArray = Object.keys(record)
			.map(key => (record[key] || record[key] != '') 
				? `*${key}:* ${record[key]}\n` : '');
		return { text: textArray.join('') };
	});
	return `{"text": "${title}", "attachments" : ${JSON.stringify(attachments)}}`;
};