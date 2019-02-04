const AWS = require('aws-sdk');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

exports.configure = async () => {
	let docs = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'docs.json'), 'utf8'));
	let dbConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../resources/dynamodb-table.yml'), 'utf8'));
	let connParams = {
		endpoint: 'http://dynamodb:8000',
		credentials: new AWS.Credentials('123', '123'),
		region: 'us-east-1'
	};
	AWS.config.update(connParams);
	let client = new AWS.DynamoDB(connParams);
	let documentClient = new AWS.DynamoDB.DocumentClient(connParams);
	let tableName = 'parking-dev';
	let params = {
		...dbConfig.Resources.dynamodb.Properties,
		TableName: tableName,
	};

	try {
		await createTableAsync(client, params);
		for (let id in docs) {
			let item = {
				TableName: tableName,
				Item: {
					...docs[id]
				}
			};
			await addItemAsync(documentClient, item);
		}
	} catch (error) {
		console.error(error);
		return false;
	}
	return true;
};

function createTableAsync(awsClient, params) {
	return new Promise((resolve, reject) => {
		awsClient.createTable(params, function(tableErr, tableData) {
			if (tableErr) {
				reject(tableErr);
			} else {
				resolve(tableData);
			}
		});
	});
}

function addItemAsync(awsDocumentClient, item) {
	return new Promise((resolve, reject) => {
		awsDocumentClient.put(item, function(tableErr, tableData) {
			if (tableErr) {
				reject(tableErr);
			} else {
				resolve(tableData);
			}
		});
	});
}
