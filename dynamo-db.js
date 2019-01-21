'use strict'
const uuid = require('uuid');
const AWS = require('aws-sdk');

exports.saveReservation = (reservation) => {
    let params = {
        Item: { reservation_id: uuid.v1(), ...reservation },
        TableName: 'reservation'
    }
    let dynamo = new AWS.DynamoDB.DocumentClient();
    return dynamo.put(params).promise();
}