'use strict';

const axios = require('axios');
const queryString = require('query-string');
const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');

exports.authorize = (payload) => {
	return axios.post('https://slack.com/api/oauth.access',
		queryString.stringify(payload)
	);
};

exports.oAuthRedirectUrl = (payload) => {
	return Promise.resolve({
		statusCode: 301,
		headers: {
			Location: `https://slack.com/oauth/authorize?${queryString.stringify(payload)}`
		}
	});
};

exports.isVerified = (request, signingSecret) => {
	const signatureProperty = 'X-Slack-Signature';
	const timestampProperty = 'X-Slack-Request-Timestamp';

	if (!request.hasOwnProperty('headers')) return false;
	if (!request.headers.hasOwnProperty(signatureProperty) || !request.headers.hasOwnProperty(timestampProperty)) return false;
	if (typeof signingSecret == 'undefined') return false;
	if (typeof signingSecret != 'string') return false;

	const signature = request.headers[signatureProperty];
	const timestamp = request.headers[timestampProperty];

	if (!signature || !timestamp) return false;

	const hmac = crypto.createHmac('sha256', signingSecret);
	const [version, hash] = signature.split('=');

	// Check if the timestamp is too old
	const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5);
	if (timestamp < fiveMinutesAgo) return false;

	hmac.update(`${version}:${timestamp}:${request.body}`);

	// check that the request signature matches expected value
	return Promise.resolve(timingSafeCompare(hmac.digest('hex'), hash));
};