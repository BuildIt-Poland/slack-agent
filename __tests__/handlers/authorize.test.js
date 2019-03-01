const { authorize } = require('../../app/handlers/authorize.js');

jest.mock('../../app/services/authService.js', () => ({
  oAuthRedirectUrl: () => '',
  authorize: jest.fn(() => ({
    status: 200,
    body: 'Authorized',
  })),
}));

describe('authorize handler module tests', () => {
  describe('Check authorize(event) function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('authorize(event) function returns 200 if code is filled in queryStringParameters', async () => {
      const authorized = await authorize({ queryStringParameters: { code: 234 } });

      expect(authorized.statusCode).toBe(200);
    });
    it(`authorize(event) function returns 301 if there isn't code in queryStringParameters`, async () => {
      const authorized = await authorize({ queryStringParameters: {} });
      expect(authorized.statusCode).toBe(301);
    });
  });
});
