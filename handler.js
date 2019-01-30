'use strict';

const auth = require('./authorization.js');
const parkingPlace = require('./parkingPlace.js');
const slackMessages = require('./slackMessages.js');

const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET,
  CLIENT_ID = process.env.SLACK_CLIENT_ID,
  CLIENT_SCOPES = process.env.SLACK_CLIENT_SCOPES,
  SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET,
  TABLE_NAME = process.env.TABLE_NAME;

module.exports.authorization = async (event) => {
  const params = {
    code: null,
    ...event.queryStringParameters,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  }
  if (!params.code)
    return await auth.oAuthRedirectUrl({
      ...event,
      scope: CLIENT_SCOPES,
      client_id: CLIENT_ID
    });
  await auth.authorize(params);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Authorized',
      input: event,
    })
  }
};

module.exports.parkingPlace = async (event) => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET);
  if (!isValid) return {
    statusCode: 401
  }
  const place = await parkingPlace.createPlace(event, TABLE_NAME);
  if (!place) return {
    statusCode: 400
  }
  const result = await parkingPlace.saveParkingPlace(place, TABLE_NAME);
  return result ? {
    statusCode: 200,
    body: slackMessages.parkingPlaceAddedSlackMessage(place)
  } : {
      statusCode: 500
    }
}

module.exports.parkingPlaceList = async (event) => {
  const isValid = await auth.isVerified(event, SIGNING_SECRET);
  if (!isValid) return {
    statusCode: 401
  }
  const result = await parkingPlace.getParkingPlaces(TABLE_NAME);
  return {
    statusCode: 200,
    body: slackMessages.listParkingPlaceSlackMessage(result.Items)
  }
}