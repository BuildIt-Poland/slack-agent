
/* global describe it beforeEach afterEach */
const { expect } = require('chai');
const AWS = require('aws-sdk-mock');
const log = require('npmlog');
const parkingPlace = require('../workers/parkingPlace.js');

describe('ParkingPlace module tests', () => {
  describe('Check saveParkingPlace(placeParams, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        if (typeof params.TableName !== 'undefined' && params.TableName == 'parking-dev' && typeof params.Item.City !== 'undefined') callback(null, true);
        else callback({ error: 'error' }, false);
      });
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
        callback(null, { Items: [] });
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns true', async () => {
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11',
      }, 'parking-dev');
      expect(place).to.equal(true);
    });
    it('returns false', async () => {
      const place = await parkingPlace.saveParkingPlace({}, 'parking-dev');
      expect(place).to.equal(false);
    });
  });
  describe('Check saveParkingPlace(placeParams, tableName) function when place exists', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        if (typeof params.TableName !== 'undefined' && params.TableName == 'parking-dev' && typeof params.Item.City !== 'undefined') callback(null, true);
        else callback({ error: 'error' }, false);
      });
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
        callback(null, {
          Items: [
            {
              Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
              City: 'Gdansk',
              Place: 11,
            },
          ],
        });
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns true', async () => {
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11',
      }, 'parking-dev');
      expect(place).to.equal(false);
    });
  });
});

describe('ParkingPlace failures module tests', () => {
  beforeEach(function () {
    this.sinon.stub(log, 'log');
  });

  afterEach(function () {
    this.sinon.restore();
  });
  describe('Check saveParkingPlace(placeParams, tableName) function when scan failures', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback(null, true);
      });
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
        callback({ error: 'error' }, false);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns false', async () => {
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11',
      }, 'parking-dev');
      expect(place).to.equal(false);
    });
  });
  describe('Check saveParkingPlace(placeParams, tableName) function when put failures', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback({ error: 'error' }, false);
      });
      AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
        callback(null, { Items: [] });
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns false', async () => {
      const place = await parkingPlace.saveParkingPlace({
        city: 'Gdansk',
        place: '11',
      }, 'parking-dev');
      expect(place).to.equal(false);
    });
  });
});
