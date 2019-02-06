const uuid = require('uuid');
const AWS = require('aws-sdk');

let configParams = {};
if (typeof process.env.LOCAL_DB != 'undefined') {
	configParams = {
		endpoint: 'http://dynamodb:8000',
		credentials: new AWS.Credentials('123', '123'),
		region: 'us-east-1'
	};
}

exports.save = async (record, tableName) => {
	const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
	const params = {
		Item: {
			Id: uuid.v1(),
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

exports.update = (params) => {
	const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
	return documentClient.update(params).promise();
};