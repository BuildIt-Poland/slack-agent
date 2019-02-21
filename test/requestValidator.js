
/* global describe it */
const { expect } = require('chai');
const { isFutureDate, isCity} = require('../utility/requestValidator.js');

describe('requestValidator module tests', () => {
  describe('Check isFutureDate(date) function', () => {
    it('returns true', () => {
        expect(isFutureDate('2030/03/02')).to.equal(true);
    });
    it('returns false', () => {
        expect(isFutureDate('2010/03/02')).to.equal(false);
    });
  });
  describe('Check isCity(city) function', () => {
    it('returns true', () => {
        expect(isCity('Gdansk')).to.equal(true);
    });
    it('returns false', () => {
        expect(isCity('213Gdansk')).to.equal(false);
    });
    it('returns false', () => {
        expect(isCity('Gd$ans')).to.equal(false);
    });
  });
});