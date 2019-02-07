'use strict';
const AWS = require('aws-sdk');
const dynamoEnv = require('./dynamoEnv.js');
const configParams = dynamoEnv.awsEnv();

exports.save = async (record, tableName) => {
	const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
	const params = {
		Item: {
			...record
		},
		TableName: tableName
	};
	return await documentClient.put(params).promise();
};

exports.scan = (params) => {
	const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
	return documentClient.scan(params).promise();
};

exports.query = (params) => {
	const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
	return documentClient.query(params).promise();
};

exports.update = (params) => {
	const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
	return documentClient.update(params).promise();
};