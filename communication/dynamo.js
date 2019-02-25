const AWS = require('aws-sdk');
const dynamoEnv = require('./dynamoEnv.js');
const { TABLE_NAME } = require('../config/all.js');

const configParams = dynamoEnv.awsEnv();

const decorateParamsWithTableName = params => ({
  ...params,
  TableName: TABLE_NAME,
});

exports.save = async (record) => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  const params = {
    Item: {
      ...record,
    },
  };

  return documentClient.put(decorateParamsWithTableName(params)).promise();
};

exports.scan = params => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  return documentClient.scan(decorateParamsWithTableName(params)).promise();
};

exports.query = params => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  return documentClient.query(decorateParamsWithTableName(params)).promise();
};

exports.update = params => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  return documentClient.update(decorateParamsWithTableName(params)).promise();
};
