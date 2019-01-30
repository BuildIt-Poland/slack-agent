'use strict';

const axios = require('axios');
const queryString = require('query-string');
const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');

exports.authorize = (payload) => {
  return axios.post('https://slack.com/api/oauth.access',
    queryString.stringify(payload)
  )
}

exports.oAuthRedirectUrl = (payload) => {
  return Promise.resolve({
    statusCode: 301,
    headers: {
      Location: `https://slack.com/oauth/authorize?${queryString.stringify(payload)}`
    }
  });
}

exports.isVerified = (request, signingSecret) => {
  const signature = request.headers['X-Slack-Signature'];
  const timestamp = request.headers['X-Slack-Request-Timestamp'];

  if (!signature || !timestamp) return false;

  const hmac = crypto.createHmac('sha256', signingSecret);
  const [version, hash] = signature.split('=');

  // Check if the timestamp is too old
  const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5);
  if (timestamp < fiveMinutesAgo) return false;

  hmac.update(`${version}:${timestamp}:${request.body}`);

  // check that the request signature matches expected value
  return Promise.resolve(timingSafeCompare(hmac.digest('hex'), hash));
}