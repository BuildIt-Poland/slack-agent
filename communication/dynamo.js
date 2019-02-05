'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamoEnv = require('./dynamoEnv.js');
const dynamoClient = new AWS.DynamoDB.DocumentClient(dynamoEnv.awsEnv());

exports.save = (record, tableName) => {
	const params = {
		Item: {
			Id: uuid.v1(),
			...record
		},
		TableName: tableName
	};
	return dynamoClient.put(params).promise();
};

exports.scan = (params) => {
	return dynamoClient.scan(params).promise();
};