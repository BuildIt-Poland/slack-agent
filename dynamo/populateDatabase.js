const _ = require('lodash');
const AWS = require('aws-sdk');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const dynamoEnv = require('../communication/dynamoEnv.js');
const log = require('../services/loggerService.js');

function createTable(awsClient, params) {
  return new Promise((resolve, reject) => {
    awsClient.createTable(params, (tableErr, tableData) => {
      if (tableErr) {
        reject(tableErr);
      } else {
        resolve(tableData);
      }
    });
  });
}

function addItem(awsDocumentClient, item) {
  return new Promise((resolve, reject) => {
    awsDocumentClient.put(item, (tableErr, tableData) => {
      if (tableErr) {
        reject(tableErr);
      } else {
        resolve(tableData);
      }
    });
  });
}

exports.populate = async () => {
  const docs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../dynamo/content/parkingPlaces.json'), 'utf8'));
  const dbConfig = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, '../dynamo/tableSchema/parkingPlacesTable.yml'), 'utf8')
  );
  const connParams = dynamoEnv.awsEnv();
  const client = new AWS.DynamoDB(connParams);
  const documentClient = new AWS.DynamoDB.DocumentClient(connParams);
  const tableName = 'parkingPlaces-dev';
  const params = {
    ...dbConfig.Resources.dynamodb.Properties,
    TableName: tableName
  };

  try {
    await createTable(client, params);

    const addItemsPromises = _.map(docs, (id) =>
      addItem(documentClient, {
        TableName: tableName,
        Item: id
      })
    );

    await Promise.all(addItemsPromises);
  } catch (error) {
    log.error('populateDatabase.populate', error);
    return false;
  }
  return true;
};
