const uuid = require('uuid');
const AWS = require('aws-sdk');
let params = {};
if (typeof process.env.LOCAL_DB != 'undefined'){
	params = {
		endpoint: 'http://dynamodb:8000',
		credentials: new AWS.Credentials('123', '123'),
		region: 'us-east-1'
	};
}
const dynamoClient = new AWS.DynamoDB.DocumentClient(params);

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