const moxios = require('moxios');
const { oAuthRedirectUrl, authorize, isVerified } = require('../../app/services/authService.js');

describe('authService.test.js', () => {
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

      const url = authorize(payload);

      await expect(url).rejects.toEqual(new Error('Dev environment - no security.'));
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
    it('returns false when missing headers properties in request', async () => {
      const verified = isVerified({}, {});

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
    });

    it('returns false when missing X-Slack-Signature and X-Slack-Request-Timestamp properties', async () => {
      const verified = isVerified({ headers: {} }, {});

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
    });

    it('returns false if properties are not defined properly is undefined', async () => {
      const request = {
        headers: {
          'X-Slack-Signature': false,
          'X-Slack-Request-Timestamp': false,
        },
      };

      const verified = isVerified(request, '85c51f2e87bf29a6b1976386c542887f');

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
    });

    it('returns false signingSecret is undefined', async () => {
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': '1548754209',
        },
      };

      const verified = isVerified(request, undefined);

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
    });

    it('returns false signingSecret is not a string', async () => {
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': '1548754209',
        },
      };
      const verified = isVerified(request, 1234);

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
    });

    it('returns false when timestamp is too old', async () => {
      const request = {
        headers: {
          'X-Slack-Signature':
            'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
          'X-Slack-Request-Timestamp': '1548754209',
        },
      };
      const verified = isVerified(request, '85c51f2e87bf29a6b1976386c542887f');

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
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
      const verified = isVerified(request, '85c51f2e87bf29a6b1976386c542887f');

      await expect(verified).rejects.toEqual(new Error('User unauthorized'));
    });

    it('returns true for dev stage', async () => {
      const verified = await isVerified({}, {}, 'dev');

      expect(verified).toBe(true);
    });
  });
});
