'use strict';

const authorizer = require('./authorizer');
const dynamoDb = require('./dynamo-db.js');

module.exports.authorization = (event, context) => {
  const code = event.queryStringParameters.code;
  return authorizer(code).then((res) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Authorization was called',
        input: event,
      }),
    };
  })
  .catch((error) => {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error,
        input: event,
      }),
    };
  });
};

module.exports.placeReservation = (event, context) => {
  dynamoDb.saveReservation().then(cos => {
    console.log(cos);
  })
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Reservation made',
      input: event,
    }),
  };
};