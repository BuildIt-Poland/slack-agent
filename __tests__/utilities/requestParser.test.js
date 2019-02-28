/* global describe it */
const { parseBodyToObject } = require('../../app/utilities/requestParser.js');
const { isFutureDate, isCity } = require('../../app/utilities/requestValidator.js');

describe.only('requestParser.test.js', () => {
  describe('Checks parseBodyToObject method', () => {
    it('returns valid and parsed object', () => {
      const { isValid, message } = parseBodyToObject('text=2030/02/21+Gdansk&user_name=john.doe', {
        dates: {
          isFutureDate,
          required: date => !!date,
        },
        city: {
          pattern: isCity,
          required: date => !!date,
        },
        userName: {},
      });

      expect(isValid).toBe(true);
      expect(message.dates).toBe('2030/02/21');
      expect(message.city).toBe('Gdansk');
      expect(message.userName).toBe('john.doe');
    });

    it(`returns invalid object when parseBodyToObject method is called with 'text=2019/02/21&user_name=user'`, () => {
      const { isValid, message } = parseBodyToObject('text=2019/02/21&user_name=user', {
        dates: {
          isFutureDate,
          required: date => !!date,
        },
        city: {
          pattern: isCity,
          required: date => !!date,
        },
        userName: {},
      });

      expect(isValid).toBe(false);
      expect(message).toBe('Invalid command');
    });
  });
});
