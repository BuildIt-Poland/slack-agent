const { isFutureDate, isCity } = require('../../app/utilities/requestValidator.js');

describe('requestValidator.test.js', () => {
  describe('Checks isFutureDate method', () => {
    it('returns true for future dates', () => {
      expect(isFutureDate('2030/03/02')).toBe(true);
    });
    it('returns false for past dates', () => {
      expect(isFutureDate('2010/03/02')).toBe(false);
    });
  });

  describe('Checks isCity method', () => {
    it('returns true for strings with characters [A-Z,a-z]', () => {
      expect(isCity('Gdansk')).toBe(true);
    });
    it('returns false for strings with numbers', () => {
      expect(isCity('213Gdansk')).toBe(false);
    });
    it('returns false for strings with special characters', () => {
      expect(isCity('Gd$ansk')).toBe(false);
    });
  });
});
