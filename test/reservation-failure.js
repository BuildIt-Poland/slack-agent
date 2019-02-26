/* global describe it beforeEach afterEach */
const { expect } = require('chai');
const AWS = require('aws-sdk-mock');
const log = require('npmlog');
const {
  saveReservation,
  findFreePlace,
  findReservationByDate,
  listReservationsForDay,
  deleteReservationPlace
} = require('../workers/reservation.js');

function initLogStub() {
  this.sinon.stub(log, 'log');
}

function restoreLogStub() {
  this.sinon.restore();
}

describe('Reservation failures module tests', () => {
  beforeEach(initLogStub);

  afterEach(restoreLogStub);

  describe('Check saveReservation(reservationId, place, Dates, tableName) function', () => {
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
      const reservation = await saveReservation(
        null,
        {
          City: 'Gdansk',
          Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
          Place: 11
        },
        '11022019',
        'ParkingPlaces-dev'
      );
      expect(reservation).to.equal(false);
    });
    it('returns false due to put error', async () => {
      const reservation = await saveReservation(
        '6f89ddc0-287d-11e9-ab74-83664e1af429',
        {
          City: 'Gdansk',
          Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
          Place: 12
        },
        '11022019',
        'ParkingPlaces-dev'
      );
      expect(reservation).to.equal(false);
    });
  });
  describe('Check findReservationByDate(date, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback({ error: 'error' }, null);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns null', async () => {
      const reservation = await findReservationByDate('11022019', 'ParkingPlaces-dev');
      expect(reservation).equal(null);
    });
  });
  describe('Check findFreePlace(reservation, city, tableName) function', () => {
    beforeEach(() => {
      AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback({ error: 'error' }, null);
      });
    });
    afterEach(() => {
      AWS.restore('DynamoDB.DocumentClient');
    });
    it('returns null', async () => {
      const freePlace = await findFreePlace({}, 'Gdansk', 'ParkingPlaces-dev');
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
      const allReservations = await listReservationsForDay({}, 'Gdansk', 'ParkingPlaces-dev');
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
        userName: 'maciej.hein'
      };
      const reservation = {
        Id: '11022019',
        City: 'multiple',
        Reservations: [
          {
            City: 'Gdansk',
            Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
            Place: 12,
            Reservation: 'maciej.hein'
          }
        ]
      };
      const deleted = await deleteReservationPlace(reservation, params, 'ParkingPlaces-dev');
      expect(deleted).equals(false);
    });
  });
});
