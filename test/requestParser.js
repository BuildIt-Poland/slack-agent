
/* global describe it */
const { expect } = require('chai');
const { parseBodyToObject } = require('../utility/requestParser.js');
const { isFutureDate, isCity} = require('../utility/requestValidator.js');

describe('Request Parser module tests', () => {
  describe('Check parseBodyToObject() function', () => {
    it('returns valid object', () => {
      const { isValid, message } = parseBodyToObject('text=2019/02/21+Gdansk&user_name=user', {
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
      expect(message).to.haveOwnProperty('dates', '2019/02/21');
      expect(message).to.haveOwnProperty('city', 'Gdansk');
      expect(message).to.haveOwnProperty('userName', 'user')
    });
    it('returns invalid object for text=2019/02/21&user_name=user', () => {
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