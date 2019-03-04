const _ = require('lodash');
const axios = require('axios');
const queryString = require('query-string');
const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');

const SLACK_SIGNATURE_HEADER = 'X-Slack-Signature';
const SLACK_TIMESTAMP_HEADER = 'X-Slack-Request-Timestamp';

exports.oAuthRedirectUrl = (authParams) => `https://slack.com/oauth/authorize?${queryString.stringify(authParams)}`;

exports.authorize = (payload) => {
	if (payload.stage === 'dev') {
    return Promise.resolve('Dev environment - no security.');
  }

	return axios.post('https://slack.com/api/oauth.access', queryString.stringify(payload));
};

exports.isVerified = (request, signingSecret, stage) => {
  const signature = request.headers && request.headers[SLACK_SIGNATURE_HEADER];
  const timestamp = request.headers && request.headers[SLACK_TIMESTAMP_HEADER];

	if (stage === 'dev') {
    return Promise.resolve(true);
  }

	if (!_.has(request, 'headers') || !signature || !timestamp || !_.isString(signingSecret)){
    return false;
  }

	// Check if the timestamp is too old
	const fiveMinutesAgo = Date.now() / 1000 - 60 * 5;
	if (timestamp < fiveMinutesAgo) {
    return false
  };

	const hmac = crypto.createHmac('sha256', signingSecret);
	const [ version, hash ] = signature.split('=');
	hmac.update(`${version}:${timestamp}:${request.body}`);

	// check that the request signature matches expected value
	return Promise.resolve(timingSafeCompare(hmac.digest('hex'), hash));
};
