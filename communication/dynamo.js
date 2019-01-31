const uuid = require('uuid');
import AWS from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();

exports.save = (record, tableName) => {
    const params = {
        Item: {
            Id: uuid.v1(),
            ...record
        },
        TableName: tableName
    }
    return dynamoClient.put(params).promise();
}

exports.scan = (params) => {
    return dynamoClient.scan(params).promise();
}