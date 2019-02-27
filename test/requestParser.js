/* global describe it */
const { expect } = require('chai');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { isFutureDate, isCity} = require('../utilities/requestValidator.js');

describe('Request Parser module tests', () => {
  describe('Check parseBodyToObject(body, inputFormat) function', () => {
    it('returns valid and parsed object', () => {
      const { isValid, message } = parseBodyToObject('text=2030/02/21+Gdansk&user_name=user', {
        dates: {
          isFutureDate,
          required: date => !!date,
        },
        city: {
          pattern: isCity,
          required: date => !!date,
        },
        userName: {}
      });
      expect(isValid).to.equal(true);
      expect(message).to.haveOwnProperty('dates', '2030/02/21');
      expect(message).to.haveOwnProperty('city', 'Gdansk');
      expect(message).to.haveOwnProperty('userName', 'user')
    });
    it(`returns invalid object when parseBodyToObject(body, inputFormat) function is invoke with body parameter equals
        text=2019/02/21&user_name=user`, () => {
      const { isValid, message } = parseBodyToObject('text=2019/02/21&user_name=user', {
        dates: {
          isFutureDate,
          required: date => !!date,
        },
        city: {
          pattern: isCity,
          required: date => !!date,
        },
        userName: {}
      });
      expect(isValid).to.equal(false);
      expect(message).to.equal('Invalid command');
    });
  });
});
