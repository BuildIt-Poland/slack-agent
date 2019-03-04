const _ = require('lodash');
const { mock, restore } = require('aws-sdk-mock');

const DATABASE_PUT_DATA_FAILED = 'failed to put data in database';
const DATABASE_PUT_DATA_SUCCESS = true;

const tableUndefinedErrorMessage = () => ({ error: "typeof params.TableName == 'undefined'" });

const tableDoesNotExistErrorMessage = tableName => ({
  error: `params.TableName != ${tableName}`,
});

const incorrectKeysErrorMessage = (primaryKey, sortKey) => ({
  error: `!_.has(Item, ${primaryKey}) && !_.has(Item, ${sortKey})`,
});

exports.mockSave = (primaryKey, sortKey, tableName) => {
  mock('DynamoDB.DocumentClient', 'put', ({ Item, TableName }, callback) => {
    if (_.isUndefined(TableName)) {
      callback(tableUndefinedErrorMessage(), DATABASE_PUT_DATA_FAILED);
    } else if (TableName !== tableName) {
      callback(tableDoesNotExistErrorMessage(tableName), DATABASE_PUT_DATA_FAILED);
    }
    if (!_.has(Item, primaryKey) && !_.has(Item, sortKey)) {
      callback(incorrectKeysErrorMessage(primaryKey, sortKey), DATABASE_PUT_DATA_FAILED);
    } else {
      callback(null, DATABASE_PUT_DATA_SUCCESS);
    }
  });
};

exports.mockQuery = items => {
  mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
    callback(false, {
      Items: [items],
    });
  });
};

exports.restoreDynamoClientMock = () => restore('DynamoDB.DocumentClient');
