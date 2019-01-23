'use strict';

const axios = require('axios');
const queryString = require('query-string');
const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');

const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET,
  CLIENT_ID = process.env.SLACK_CLIENT_ID,
  CLIENT_SCOPES = process.env.SLACK_CLIENT_SCOPES,
  SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

exports.authorize = (payload) => {
  return axios.post('https://slack.com/api/oauth.access',
    queryString.stringify({
      code: payload.code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  )
}

exports.oAuthRedirectUrl = (payload) => {
  const args = {
    ...payload,
    scope: CLIENT_SCOPES,
    client_id: CLIENT_ID
  }
  return Promise.resolve({
    statusCode: 301,
    headers: {
      Location: `https://slack.com/oauth/authorize?${queryString.stringify(args)}`
    }
  });
}

exports.isVerified = (request) => {
  const signature = request.headers['X-Slack-Signature'];
  const timestamp = request.headers['X-Slack-Request-Timestamp'];

  if (!signature || !timestamp) return false;

  const hmac = crypto.createHmac('sha256', SIGNING_SECRET);
  const [version, hash] = signature.split('=');

  // Check if the timestamp is too old
  const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5);
  if (timestamp < fiveMinutesAgo) return false;

  hmac.update(`${version}:${timestamp}:${request.body}`);

  // check that the request signature matches expected value
  return Promise.resolve(timingSafeCompare(hmac.digest('hex'), hash));
}