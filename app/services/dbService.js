const AWS = require('aws-sdk');
const dynamoEnv = require('../../config/dynamoEnv.js');

const configParams = dynamoEnv.awsEnv();

const decorateParamsWithTableName = (params, tableName) => ({
  ...params,
  TableName: tableName
});

exports.save = async (record, tableName) => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  const params = {
    Item: {
      ...record
    }
  };

  return documentClient.put(decorateParamsWithTableName(params, tableName)).promise();
};

exports.scan = (params, tableName) => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  return documentClient.scan(decorateParamsWithTableName(params, tableName)).promise();
};

exports.query = (params, tableName) => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  return documentClient.query(decorateParamsWithTableName(params, tableName)).promise();
};

exports.update = (params, tableName) => {
  const documentClient = new AWS.DynamoDB.DocumentClient(configParams);
  return documentClient.update(decorateParamsWithTableName(params, tableName)).promise();
};
