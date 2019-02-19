
/* global describe it beforeEach afterEach */
const { expect } = require('chai');
const AWS = require('aws-sdk-mock');
const log = require('npmlog');
const res = require('../workers/reservation.js');

describe('Reservation failures module tests', () => {
  beforeEach(function () {
    this.sinon.stub(log, 'log');
  });

  afterEach(function () {
    this.sinon.restore();
  });

  describe('Check saveReservationAsync(reservationId, place, Dates, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback({ error: 'error' }, false);
      });
      AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
        callback({ error: 'error' }, false);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns false due to put error', async () => {
      const reservation = await res.saveReservationAsync(null, {
        City: 'Gdansk',
        Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
        Place: 11,
      }, '11022019', 'parking-dev');
      expect(reservation).to.equal(false);
    });
    it('returns false due to put error', async () => {
      const reservation = await res.saveReservationAsync('6f89ddc0-287d-11e9-ab74-83664e1af429', {
        City: 'Gdansk',
        Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
        Place: 12,
      }, '11022019', 'parking-dev');
      expect(reservation).to.equal(false);
    });
  });
  describe('Check findReservationByDateAsync(date, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback({ error: 'error' }, null);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns null', async () => {
      const reservation = await res.findReservationByDateAsync('11022019', 'parking-dev');
      expect(reservation).equal(null);
    });
  });
  describe('Check findFreePlaceAsync(reservation, city, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback({ error: 'error' }, null);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns null', async () => {
      const freePlace = await res.findFreePlaceAsync({}, 'Gdansk', 'parking-dev');
      expect(freePlace).equals(null);
    });
  });
  describe('Check listReservationsForDay(reservation, city, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback({ error: 'error' }, null);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns null', async () => {
      const allReservations = await res.listReservationsForDayAsync({}, 'Gdansk', 'parking-dev');
      expect(allReservations).equals(null);
    });
  });
  describe('Check deleteReservationPlace(reservation, reservationParams, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
        callback({ error: 'error' }, false);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns true', async () => {
      const params = {
        dates: '11022019',
        city: 'Gdansk',
        userName: 'maciej.hein',
      };
      const reservation = {
        Id: '11022019',
        City: 'multiple',
        Reservations: [{
          City: 'Gdansk',
          Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
          Place: 12,
          Reservation: 'maciej.hein',
        }],
      };
      const deleted = await res.deleteReservationPlace(reservation, params, 'parking-dev');
      expect(deleted).equals(false);
    });
  });
});
