const moxios = require('moxios');
const { oAuthRedirectUrl, authorize, isVerified } = require('../../app/services/authService.js');

describe('Authorization module tests', () => {
  describe('Check authorize() function', () => {
    beforeEach(() => {
      moxios.install();
    });

    afterEach(() => {
      moxios.uninstall();
    });

    it('creates post that calls aprioprate url with required params', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          response: { url: request.config.url, data: request.config.data },
        });
      });
      const payload = {
        code: '1111',
        client_id: 'as',
        client_secret: 'as',
        stage: 'stg',
      };
      const url = await authorize(payload);

      expect(url.config.url).toBe('https://slack.com/api/oauth.access');
      expect(url.config.data).toContain('1111');
      expect(url.config.data).toContain('code');
      expect(url.config.data).toContain('client_id');
      expect(url.config.data).toContain('client_secret');
    });

    it('returns "no security" for dev stage', async () => {
      const payload = {
        code: '1111',
        client_id: 'as',
        client_secret: 'as',
        stage: 'dev',
      };
      const url = await authorize(payload);

      expect(typeof url).toBe('string');
    });
  });

  describe('Check oAuthRedirectUrl(authParams) function', () => {
    it('returns valid slack oauth redirect url', () => {
      const authParams = {
        scope: 'test',
        client_id: '123',
      };
      const url = oAuthRedirectUrl(authParams);

      expect(url).toContain('https://slack.com/oauth/authorize?');
      expect(url).toContain('scope');
      expect(url).toContain('client_id');
    });
  });

  describe('Check isVerified() function', () => {
    it('returns false when missing headers properties in request', () => {
      const verified = isVerified({}, {});

      expect(verified).toBe(false);
    });

    it('returns false when missing X-Slack-Signature and X-Slack-Request-Timestamp properties', () => {
      const verified = isVerified({ headers: {} }, {});

      expect(verified).toBe(false);
    });

    it('returns false if properties are not defined properly is undefined', () => {
      const request = {
        headers: {
          'X-Slack-Signature': false,
          'X-Slack-Request-Timestamp': false,
        },
      };
      const verified = isVerified(request, '85c51f2e87bf29a6b1976386c542887f');

      expect(verified).toBe(false);
    });

    it('returns false signingSecret is undefined', () => {
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': '1548754209',
        },
      };
      const verified = isVerified(request, undefined);

      expect(verified).toBe(false);
    });

    it('returns false signingSecret is not a string', () => {
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': '1548754209',
        },
      };
      const verified = isVerified(request, 1234);

      expect(verified).toBe(false);
    });

    it('returns false when timestamp is too old', () => {
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': '1548754209',
        },
      };
      const verified = isVerified(request, '85c51f2e87bf29a6b1976386c542887f');

      expect(verified).toBe(false);
    });

    it("returns false when timestamp is fresh, but signature doesn't match expected value", async () => {
      const time = Date.now() / 1000 - 60 * 2;
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': time.toString(),
        },
      };
      const verified = await isVerified(request, '85c51f2e87bf29a6b1976386c542887f');

      expect(verified).toBe(false);
    });

    it('returns true for dev stage', async () => {
      const verified = await isVerified({}, {}, 'dev');

      expect(verified).toBe(true);
    });
  });
});
