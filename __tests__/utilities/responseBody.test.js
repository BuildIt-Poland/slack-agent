/* global describe it */
const {
  generateResponseBody,
  generateResponseBodyWithAttachments,
} = require('../../app/utilities/responseBody.js');

describe('responseBody.test.js', () => {
  describe('Checks generateResponseBody method', () => {
    it('returns body with text', () => {
      const body = generateResponseBody(`You can't add parking place`);
      const { text } = JSON.parse(body);

      expect(text).toBe(`You can't add parking place`);
    });
  });

  describe('Checks generateResponseBodyWithAttachments method', () => {
    it('returns body with title and attachments', () => {
      const body = generateResponseBodyWithAttachments('Places:', [
        {
          city: 'Gdansk',
          place: 11,
        },
      ]);
      const { attachments, text } = JSON.parse(body);

      expect(text).toBe('Places:');
      expect(attachments).toBeDefined();
      expect(attachments[0].text).toBe(`*city:* Gdansk\n*place:* 11\n`);
    });

    it('returns body with title and attachments when place parameter equals null', () => {
      const body = generateResponseBodyWithAttachments('Places:', [
        {
          city: 'Gdansk',
          place: null,
        },
      ]);
      const { attachments, text } = JSON.parse(body);

      expect(text).toBe('Places:');
      expect(attachments).toBeDefined();
      expect(attachments[0].text).toBe(`*city:* Gdansk\n`);
    });
  });
});
