
/* global describe it before after beforeEach afterEach */
const { expect } = require('chai');
const AWS = require('aws-sdk-mock');
const log = require('npmlog');
const dynamoLocal = require('../development/dynamoLocal.js');
require('mocha-sinon');

describe('DynamoLocal module tests', () => {
  describe('Check configure() function', () => {
    before(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        if (typeof params.TableName === 'undefined') callback({ error: 'typeof params.TableName == \'undefined\'' }, 'failed to put data in database');
        else if (params.TableName != 'parking-dev') callback({ error: 'params.TableName != \'parking-dev\'' }, 'failed to put data in database');
        else if (typeof params.Item.Types === 'undefined') callback({ error: 'typeof params.Item.Types == \'undefined\'' }, 'failed to put data in database');
        else callback(null, 'successfully put item in database');
      });
      AWS.mock('DynamoDB', 'createTable', (params, callback) => {
        if (typeof params.TableName === 'undefined') callback({ error: 'typeof params.TableName == \'undefined\'' }, 'failed to create table in database');
        else if (params.TableName != 'parking-dev') callback({ error: 'params.TableName != \'parking-dev\'' }, 'failed to create table in database');
        else callback(null, 'successfully created table in database');
      });
    });

    after(() => {
      AWS.restore('DynamoDB');
      AWS.restore('DynamoDB.DocumentClient');
    });

    it('returns true', async () => {
      const status = await dynamoLocal.configure();
      expect(status).to.equal(true);
    });
  });
});
describe('DynamoLocal failures module tests', () => {
  beforeEach(function () {
    this.sinon.stub(log, 'log');
  });

  afterEach(function () {
    this.sinon.restore();
  });

  describe('Check configure() function', () => {
    before(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback({ error: 'document big one' }, 'failed to put data in database');
      });
      AWS.mock('DynamoDB', 'createTable', (params, callback) => {
        callback({ error: 'table big one' }, 'failed to create table in database');
      });
    });

    after(() => {
      AWS.restore('DynamoDB');
      AWS.restore('DynamoDB.DocumentClient');
    });

    it('returns false due to table error', async () => {
      const status = await dynamoLocal.configure();
      expect(status).to.equal(false);
    });
  });
});
describe('DynamoLocal failures module tests', () => {
  beforeEach(function () {
    this.sinon.stub(log, 'log');
  });

  afterEach(function () {
    this.sinon.restore();
  });

  describe('Check configure() function', () => {
    before(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback({ error: 'document big one' }, 'failed to put data in database');
      });
      AWS.mock('DynamoDB', 'createTable', (params, callback) => {
        callback(null, 'successfully created table in database');
      });
    });

    after(() => {
      AWS.restore('DynamoDB');
      AWS.restore('DynamoDB.DocumentClient');
    });

    it('returns false due to put error', async () => {
      const status = await dynamoLocal.configure();
      expect(status).to.equal(false);
    });
  });
});
