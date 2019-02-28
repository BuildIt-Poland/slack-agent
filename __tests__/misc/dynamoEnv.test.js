const dynamoEnv = require('../../config/dynamoEnv.js');

const { LOCAL_DB } = process.env;

describe('dynamoEnv module tests', () => {
  describe('Check awsEnv() function', () => {
    afterEach(() => {
      process.env.LOCAL_DB = LOCAL_DB;
    });

    it('returns expected params for testing', async () => {
      process.env.LOCAL_DB = 'true';
      const params = dynamoEnv.awsEnv();

      expect(params.endpoint).toBe('http://dynamodb:8000');
      expect(params.credentials).toBeDefined();
      expect(params.region).toBe('us-east-1');
    });
    it('returns expected params for prod', async () => {
      delete process.env.LOCAL_DB;
      const params = dynamoEnv.awsEnv();

      expect(params.endpoint).toBeUndefined();
      expect(params.credentials).toBeUndefined();
      expect(params.region).toBeUndefined();
    });
  });
});
