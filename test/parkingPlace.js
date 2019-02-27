/* global describe it beforeEach afterEach */
const { expect } = require('chai');
const AWS = require('aws-sdk-mock');
const log = require('npmlog');
const _ = require('lodash');
const parkingPlace = require('../dao/parkingPlace.js');

function initLogStub() {
  this.sinon.stub(log, 'log');
}

function restoreLogStub() {
  this.sinon.restore();
}

describe('parkingPlace module tests', () => {
  describe('Check saveParkingPlace(placeParams, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', ({ Item, TableName }, callback) => {
        if (TableName === 'ParkingPlaces-dev' && _.has(Item, 'City')) callback(null, true);
        else callback({ error: 'invalid parameters' }, false);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns true when the parking space has been added to the database', async () => {
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) =>
        callback(null, { Items: [] })
      );
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11'
      });
      expect(place).to.equal(true);
    });
    it('returns false when parking place exists in database', async () => {
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) =>
        callback(null, {
          Items: [
            {
              Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
              City: 'Gdansk',
              Place: 11
            }
          ]
        })
      );
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11'
      });
      expect(place).to.equal(false);
    });
  });
});

describe('parkingPlace failures module tests', () => {
  beforeEach(initLogStub);
  afterEach(restoreLogStub);
  describe('Check saveParkingPlace(placeParams, tableName) function', () => {
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns false when database error occurred during scan', async () => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => callback(null, true));
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) =>
        callback({ error: 'database error' }, false)
      );
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11'
      });
      expect(place).to.equal(false);
    });
    it('returns false when database error occurred during save', async () => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) =>
        callback({ error: 'database error' }, false)
      );
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) =>
        callback(null, { Items: [] })
      );
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11'
      });
      expect(place).to.equal(false);
    });
  });
});
