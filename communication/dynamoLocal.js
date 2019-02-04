var AWS = require('aws-sdk');

exports.configure = () => {
	let connParams = {
		endpoint: 'http://dynamodb:8000',
		credentials: new AWS.Credentials('123', '123'),
		region: 'us-east-1'
	};
	AWS.config.update(connParams);
	
	var client = new AWS.DynamoDB(connParams);
	var documentClient = new AWS.DynamoDB.DocumentClient(connParams);
	
	var tableName = 'parking-dev';
	
	var params = {
		TableName: tableName,
		KeySchema: [
			{ AttributeName: 'Id', KeyType: 'HASH'}
		],
		AttributeDefinitions: [
			{ AttributeName: 'Id', AttributeType: 'S' }
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 1,
			WriteCapacityUnits: 1
		}
	};
	
	client.createTable(params, function(tableErr, tableData) {
		if (tableErr) {
			console.error('Error JSON:', JSON.stringify(tableErr, null, 2));
		} else {
			console.log('Created table successfully!');
		}
	
		var params = {
			TableName: tableName,
			Item: {
				'Id': '1',
				'City': 'Gdansk',
				'Place': '1a',
				'Types': 'parkingPlace'
			}
		};
	
		console.log('Adding a new item...');
		documentClient.put(params, function(err, data) {
			if (err) {
				console.error('Error JSON:', JSON.stringify(err, null, 2));
			} else {
				console.log('Added item successfully!');
			}
		});
		params = {
			TableName: tableName,
			Item: {
				'Id': '2',
				'City': 'Warszawa',
				'Place': '34',
				'Types': 'parkingPlace'
			}
		};
	
		console.log('Adding a new item...');
		documentClient.put(params, function(err, data) {
			if (err) {
				console.error('Error JSON:', JSON.stringify(err, null, 2));
			} else {
				console.log('Added item successfully!');
			}
		});
	});
};
