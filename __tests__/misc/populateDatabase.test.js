const _ = require('lodash');
const AWS = require('aws-sdk-mock');
const { populate } = require('../../devEnv/populateDatabase.js');

jest.mock('npmlog');

const DATABASE_PUT_DATA_FAILED = 'failed to put data in database';
const DATABASE_CREATE_TABLE_FAILED = 'failed to create table in database';
const DATABASE_PUT_DATA_SUCCESS = 'successfully put item in database';
const DATABASE_CREATE_TABLE_SUCCESS = 'successfully created table in database';

const tableUndefinedErrorMock = () => ({ error: "typeof params.TableName == 'undefined'" });
const tableDoesNotExistErrorMock = () => ({
  error: "params.TableName != 'ParkingPlaces-dev' || 'Bookings-dev'",
});

describe('populateDatabase.test.js', () => {
  afterEach(() => {
    AWS.restore('DynamoDB');
    AWS.restore('DynamoDB.DocumentClient');
  });

  describe('Checks populate method', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', ({ TableName }, callback) => {
        if (_.isUndefined(TableName)) {
          callback(tableUndefinedErrorMock(), DATABASE_PUT_DATA_FAILED);
        } else if (TableName !== 'ParkingPlaces-dev' && TableName !== 'Bookings-dev') {
          callback(tableDoesNotExistErrorMock(), DATABASE_PUT_DATA_FAILED);
        } else {
          callback(null, DATABASE_PUT_DATA_SUCCESS);
        }
      });

      AWS.mock('DynamoDB', 'createTable', ({ TableName }, callback) => {
        if (_.isUndefined(TableName)) {
          callback(tableUndefinedErrorMock(), DATABASE_CREATE_TABLE_FAILED);
        } else if (TableName !== 'ParkingPlaces-dev' && TableName !== 'Bookings-dev') {
          callback(tableDoesNotExistErrorMock(), DATABASE_CREATE_TABLE_FAILED);
        } else {
          callback(null, DATABASE_CREATE_TABLE_SUCCESS);
        }
      });
    });

    it('returns true', async () => {
      const status = await populate();

      expect(status).toBe(true);
    });
  });

  describe('Checks populate method', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (_params, callback) => {
        callback({ error: 'document big one' }, DATABASE_PUT_DATA_FAILED);
      });

      AWS.mock('DynamoDB', 'createTable', (_params, callback) => {
        callback({ error: 'table big one' }, DATABASE_CREATE_TABLE_FAILED);
      });
    });

    it('returns false due to table error', async () => {
      const status = await populate();

      expect(status).toBe(false);
    });
  });

  describe('Checks populate method', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (_params, callback) => {
        callback({ error: 'document big one' }, DATABASE_PUT_DATA_FAILED);
      });

      AWS.mock('DynamoDB', 'createTable', (_params, callback) => {
        callback(null, DATABASE_CREATE_TABLE_SUCCESS);
      });
    });

    it('returns false due to put error', async () => {
      const status = await populate();

      expect(status).toBe(false);
    });
  });
});
