/* global describe it */
const {
  generateResponseBody,
  generateResponseBodyWithAttachments
} = require('../../app/utilities/responseBody.js');

describe('responseBody module tests', () => {
  describe('Check generateResponseBody(text) function', () => {
    it('returns body with text', () => {
      const body = generateResponseBody(`You can't add parking place`);
      const bodyJson = JSON.parse(body);
      expect(bodyJson).to.haveOwnProperty('text', `You can't add parking place`);
    });
  });
  describe('Check generateResponseBodyWithAttachments(title, attachments) function', () => {
    it('returns body with title and attachments', () => {
      const body = generateResponseBodyWithAttachments('Places:', [
        {
          city: 'Gdansk',
          place: 11
        }
      ]);
      const bodyJson = JSON.parse(body);
      expect(bodyJson).to.haveOwnProperty('text', 'Places:');
      expect(bodyJson).to.haveOwnProperty('attachments');
      expect(bodyJson.attachments[0]).to.haveOwnProperty('text', `*city:* Gdansk\n*place:* 11\n`);
    });
    it('returns body with title and attachments when body parameter is null', () => {
      const body = generateResponseBodyWithAttachments('Places:', [
        {
          city: 'Gdansk',
          place: null
        }
      ]);
      const bodyJson = JSON.parse(body);
      expect(bodyJson).to.haveOwnProperty('text', 'Places:');
      expect(bodyJson).to.haveOwnProperty('attachments');
      expect(bodyJson.attachments[0]).to.haveOwnProperty('text', `*city:* Gdansk\n`);
    });
  });
});
