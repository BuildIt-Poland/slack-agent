const _ = require('lodash');
const AWS = require('aws-sdk');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const dynamoEnv = require('../communication/dynamoEnv.js');
const log = require('../communication/logger.js');

function createTableAsync(awsClient, params) {
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

function addItemAsync(awsDocumentClient, item) {
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

exports.configure = async () => {
  const docs = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'docs.json'), 'utf8'));
  const dbConfig = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, '../resources/dynamodb-table.yml'), 'utf8'),
  );
  const connParams = dynamoEnv.awsEnv();
  const client = new AWS.DynamoDB(connParams);
  const documentClient = new AWS.DynamoDB.DocumentClient(connParams);
  const tableName = 'parking-dev';
  const params = {
    ...dbConfig.Resources.dynamodb.Properties,
    TableName: tableName,
  };

  try {
    await createTableAsync(client, params);

    const addItemsPromises = _.map(docs, id =>
      addItemAsync(documentClient, {
        TableName: tableName,
        Item: id,
      }),
    );

    await Promise.all(addItemsPromises);
  } catch (error) {
    log.error('dynamoLocal.configure', error);
    return false;
  }
  return true;
};
