'use strict';

const authorization = require('./authorization.js');
const dynamoDb = require('./dynamo-db.js');

module.exports.authorization = async (event) => {
  const params = {
    code: null,
    ...event.queryStringParameters
  }
  if (!params.code) return await authorization.oAuthRedirectUrl(event);
  await authorization.authorize(params);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Authorized',
      input: event,
    })
  }
};

module.exports.placeReservation = async (event) => {
  const isValid = await authorization.isVerified(event);  
  if(!isValid) return {
    statusCode: 401,
    body: JSON.stringify({
      message: 'Unauthorized',
      input: event,
    }),
  }
  await dynamoDb.saveReservation();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Reservation made',
      input: event,
    }),
  };
};