/* global describe it */
const { expect } = require('chai');
const { isFutureDate, isCity} = require('../utility/requestValidator.js');

describe('requestValidator module tests', () => {
  describe('Check isFutureDate(date) function', () => {
    it('returns true for future dates', () => {
        expect(isFutureDate('2030/03/02')).to.equal(true);
    });
    it('returns false for past dates', () => {
        expect(isFutureDate('2010/03/02')).to.equal(false);
    });
  });
  describe('Check isCity(city) function', () => {
    it('returns true for strings with characters [A-Z,a-z]', () => {
        expect(isCity('Gdansk')).to.equal(true);
    });
    it('returns false for strings with numbers', () => {
        expect(isCity('213Gdansk')).to.equal(false);
    });
    it('returns false for strings with special characters', () => {
        expect(isCity('Gd$ansk')).to.equal(false);
    });
  });
});
