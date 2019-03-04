const _ = require('lodash');
const { mock, restore } = require('aws-sdk-mock');

const { BOOKINGS_TABLE, PARKING_PLACES_TABLE } = require('../../config/all.js');

exports.BOOKING = {
  availableBooking: {
    City: 'WAW',
    BookingDate: '2020/03/01',
    Places: [
      {
        PlaceID: '1a',
        Owner: 'hein.maciej',
      },
      {
        PlaceID: '1b',
        Owner: 'free',
      },
      {
        PlaceID: '1c',
        Owner: 'free',
      },
    ],
  },
  unavailableBooking: {
    City: 'WAW',
    BookingDate: '2020/03/01',
    Places: [
      {
        PlaceID: '1a',
        Owner: 'foo.bar',
      },
      {
        PlaceID: '1b',
        Owner: 'john.doe',
      },
      {
        PlaceID: '1c',
        Owner: 'mac.gyver',
      },
    ],
  },
};

exports.PARKING_PLACES = {
  City: 'GDN',
  PlaceID: '1a',
};

const DATABASE_PUT_DATA_FAILED = 'failed to put data in database';
const DATABASE_PUT_DATA_SUCCESS = true;

const tableUndefinedErrorMock = () => ({ error: "typeof params.TableName == 'undefined'" });

const tableDoesNotExistErrorMock = tableName => ({
  error: `params.TableName != ${tableName}`,
});

const incorrectKeysErrorMock = (primaryKey, sortKey) => ({
  error: `!_.has(Item, ${primaryKey}) && !_.has(Item, ${sortKey})`,
});

const save = (primaryKey, sortKey, tableName) => {
  mock('DynamoDB.DocumentClient', 'put', ({ Item, TableName }, callback) => {
    if (_.isUndefined(TableName)) {
      callback(tableDoesNotExistErrorMock(), DATABASE_PUT_DATA_FAILED);
    } else if (TableName !== tableName) {
      callback(tableUndefinedErrorMock(tableName), DATABASE_PUT_DATA_FAILED);
    }
    if (!_.has(Item, primaryKey) && !_.has(Item, sortKey)) {
      callback(incorrectKeysErrorMock(primaryKey, sortKey), DATABASE_PUT_DATA_FAILED);
    } else {
      callback(null, DATABASE_PUT_DATA_SUCCESS);
    }
  });
};

exports.saveBooking = () => {
  save('City', 'BookingDate', BOOKINGS_TABLE);
};
exports.saveParkingPlace = () => {
  save('City', 'PlaceID', PARKING_PLACES_TABLE);
};

exports.query = items => {
  mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
    callback(false, {
      Items: [items],
    });
  });
};

exports.restoreDynamoClient = () => restore('DynamoDB.DocumentClient');
