'use strict';
/* global describe it beforeEach afterEach */
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');
var res = require('../workers/reservation.js');
const log = require('npmlog');
require('mocha-sinon');

describe('Reservation module tests', () => {
	describe('Check saveReservationAsync(reservationId, place, Dates, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
				if (typeof params.TableName != 'undefined' && params.TableName == 'parking-dev' && typeof params.Item.City != 'undefined')
					callback(null, true);
				else
					callback({ error: 'error'}, false);
			});
			AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
				if (typeof params.TableName != 'undefined' && params.TableName == 'parking-dev')
					callback(null, true);
				else
					callback({ error: 'error'}, false);
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns true', async () => {
			const reservation = await res.saveReservationAsync(null, {
				Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
				City: 'Gdansk',
				Place: 11
			}, {
				Dates: '11022019',
				City: 'Gdansk',
				UserName: 'mhein'
			}, 'parking-dev');
			expect(reservation).to.equal(true);
		});
		it('returns true', async () => {
			const reservation = await res.saveReservationAsync('11022019', {
				Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
				City: 'Gdansk',
				Place: 12
			}, {
				Dates: '11022019',
				City: 'Gdansk',
				UserName: 'mhein'
			}, 'parking-dev');
			expect(reservation).to.equal(true);
		});
	});
	describe('Check findReservationByDateAsync(date, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
				callback(null, {
					Items: [{
						Id: '11022019',
						City: 'multiple',
						Reservations: [
							{
								City: 'Gdansk',
								Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
								Place: 12,
							}]
					}]
				});
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns reservation object', async () => {
			const reservation = await res.findReservationByDateAsync('11022019', 'parking-dev');
			expect(reservation).to.be.a('object').have.property('Id', '11022019');
		});
	});
	describe('Check findReservationByDateAsync(date, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
				callback(null, { Items: [] });
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns empty objects', async () => {
			const reservation = await res.findReservationByDateAsync('11022019', 'parking-dev');
			expect(reservation).to.be.deep.equal({});
		});
	});
	describe('Check findFreePlaceAsync(reservation, city, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
				callback(null, {
					Items: [{
						Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
						City: 'Gdansk',
						Place: 11
					},
					{
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						City: 'Gdansk',
						Place: 12,
					}]
				});
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns place object', async () => {
			const reservation = {
				Id: '11022019',
				City: 'multiple',
				Reservations: [
					{
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						City: 'Gdansk',
						Place: 12,
					}]
			};
			const freePlace = await res.findFreePlaceAsync(reservation, 'Gdansk', 'parking-dev');
			expect(freePlace).to.be.a('object').have.property('Id');
			expect(freePlace).have.property('City');
			expect(freePlace).have.property('Place');
		});
		it('returns empty object', async () => {
			const reservation = {
				Id: '11022019',
				City: 'multiple',
				Reservations: [
					{
						Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
						City: 'Gdansk',
						Place: 11,
					},
					{
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						City: 'Gdansk',
						Place: 12,
					}]
			};
			const freePlace = await res.findFreePlaceAsync(reservation, 'Gdansk', 'parking-dev');
			expect(freePlace).to.be.deep.equal({});
		});
	});
	describe('Check listReservationsForDay(reservation, city, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
				callback(null, {
					Items: [{
						Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
						City: 'Gdansk',
						Place: 11,
					},
					{
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						City: 'Gdansk',
						Place: 12,
					}]
				});
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns reservations array', async () => {
			const reservation = {
				Id: '11022019',
				City: 'multiple',
				Reservations: [
					{
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						City: 'Gdansk',
						Place: 12,
						Reservation: 'mhein'
					}]
			};
			const allReservations = await res.listReservationsForDayAsync(reservation, 'Gdansk', 'parking-dev');
			expect(allReservations).to.be.a('array');
			expect(allReservations[0]).have.property('City');
			expect(allReservations[0]).have.property('Place');
			expect(allReservations[0]).have.property('Reservation');
		});
		it('returns reservations array with empty reservation parameter', async () => {
			const allReservations = await res.listReservationsForDayAsync({}, 'Gdansk', 'parking-dev');
			expect(allReservations).to.be.a('array');
			expect(allReservations[0]).have.property('City');
			expect(allReservations[0]).have.property('Place');
			expect(allReservations[0]).have.property('Reservation');
		});
	});
});

describe('Reservation failures module tests', () => {
	beforeEach(function() {
		this.sinon.stub(log, 'log');
	});
    
	afterEach(function() {
		this.sinon.restore();
	});

	describe('Check saveReservationAsync(reservationId, place, Dates, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
				callback({ error: 'error'}, false);
			});
			AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
				callback({ error: 'error'}, false);
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
				callback({error: 'error'}, null);
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
				callback({error: 'error'}, null);
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
				callback({error: 'error'}, null);
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
});