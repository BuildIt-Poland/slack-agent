
/* global describe it beforeEach afterEach */
const { expect } = require('chai');
const dynamoEnv = require('../communication/dynamoEnv.js');

describe('dynamoEnv module tests', () => {
  let val;
  describe('Check awsEnv() function', () => {
    beforeEach(() => {
      val = process.env.LOCAL_DB;
    });

    afterEach(() => {
      process.env.LOCAL_DB = val;
    });

    it('returns expected params for testing', async () => {
      process.env.LOCAL_DB = 'true';
      const params = dynamoEnv.awsEnv();
      expect(params.endpoint).to.equal('http://dynamodb:8000');
      expect(typeof params.credentials).to.equal('object');
      expect(params.region).to.equal('us-east-1');
    });
    it('returns expected params for prod', async () => {
      delete process.env.LOCAL_DB;
      const params = dynamoEnv.awsEnv();
      expect(typeof params.endpoint).to.equal('undefined');
      expect(typeof params.credentials).to.equal('undefined');
      expect(typeof params.region).to.equal('undefined');
    });
  });
});
