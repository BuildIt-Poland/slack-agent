const _ = require('lodash');
const AWS = require('aws-sdk');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const dynamoEnv = require('../config/dynamoEnv.js');
const log = require('../app/services/loggerService.js');
const { BOOKINGS_TABLE, PARKING_PLACES_TABLE } = require('../config/all.js');

const dynamoTablesMap = {
  parkingPlaces: {
    tableName: PARKING_PLACES_TABLE,
    contentPath: '../devEnv/dbContent/parkingPlaces.json',
    schemaPath: '../dynamo/tableSchema/parkingPlacesTable.yml',
  },
  bookings: {
    tableName: BOOKINGS_TABLE,
    contentPath: '../devEnv/dbContent/bookings.json',
    schemaPath: '../dynamo/tableSchema/bookingsTable.yml',
  },
};

const createTable = (awsClient, params) =>
  new Promise((resolve, reject) => {
    awsClient.createTable(params, (tableErr, tableData) => {
      if (tableErr) {
        reject(tableErr);
      } else {
        resolve(tableData);
      }
    });
  });

const addItem = (awsDocumentClient, item) =>
  new Promise((resolve, reject) => {
    awsDocumentClient.put(item, (tableErr, tableData) => {
      if (tableErr) {
        reject(tableErr);
      } else {
        resolve(tableData);
      }
    });
  });

const populateTable = async table => {
  const connParams = dynamoEnv.awsEnv();
  const awsClient = new AWS.DynamoDB(connParams);
  const awsDocumentClient = new AWS.DynamoDB.DocumentClient(connParams);

  const { tableName, contentPath, schemaPath } = dynamoTablesMap[table];
  const docs = JSON.parse(fs.readFileSync(path.resolve(__dirname, contentPath), 'utf8'));
  const dbConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, schemaPath), 'utf8'));
  const params = {
    ...dbConfig.Resources[table].Properties,
    TableName: tableName,
  };

  await createTable(awsClient, params);

  const addItemsPromises = _.map(docs, id =>
    addItem(awsDocumentClient, {
      TableName: tableName,
      Item: id,
    }),
  );

  await Promise.all(addItemsPromises);
};

exports.populate = async () => {
  try {
    await populateTable('parkingPlaces');
    await populateTable('bookings');
  } catch (error) {
    log.error('populateDatabase.populate', error);
    return false;
  }
  return true;
};
