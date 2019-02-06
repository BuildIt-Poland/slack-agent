'use strict';
/* global describe it beforeEach afterEach */
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');
var res = require('../workers/reservation.js');

describe('Reservation module tests', () => {
	describe('Check saveReservationAsync(reservationId, place, Dates, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
				callback(null, true);
			});
			AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
				callback(null, true);
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('create new reservation with place reservation', async () => {
			const reservation = await res.saveReservationAsync(null, {
				City: 'Gdansk',
				Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
				Place: 11,
				Types: 'parkingPlace'
			}, '11022019', 'parking-dev');
			expect(reservation).to.equal(true);
		});
		it('update existing reservation object by adding new reservation place', async () => {
			const reservation = await res.saveReservationAsync('6f89ddc0-287d-11e9-ab74-83664e1af429', {
				City: 'Gdansk',
				Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
				Place: 12,
				Types: 'parkingPlace'
			}, '11022019', 'parking-dev');
			expect(reservation).to.equal(true);            
		});
	});
	describe('Check findReservationByDateAsync(date, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
				callback(null, { Items: [{
					Id: '78b32460-287d-11e9-ae75-1578cdc7c640',
					Dates: '11022019',
					Reservations: [
						{
							City: 'Gdansk',
							Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
							Place: 12,
							Types: 'parkingPlace'
						}]
				}]});
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns reservation for specific date', async () => {
			const reservation = await res.findReservationByDateAsync('11022019', 'parking-dev');
			expect(reservation).to.be.a('object').have.property('Dates','11022019');
		});
	});
	describe('Check findReservationByDateAsync(date, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
				callback(null, { Items: []});
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns undefined', async () => {
			const reservation = await res.findReservationByDateAsync('11022019', 'parking-dev');
			expect(reservation).equal(undefined);
		});
	});
	describe('Check findFreePlaceAsync(reservation, city, tableName) function', () => {
		beforeEach(() => {
			AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
				callback(null, { Items: [{
					City: 'Gdansk',
					Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
					Place: 11,
					Types: 'parkingPlace'
				},
				{
					City: 'Gdansk',
					Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
					Place: 12,
					Types: 'parkingPlace'
				}]});
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns free place', async () => {
			const reservation = {
				Id: '78b32460-287d-11e9-ae75-1578cdc7c640',
				Dates: '11022019',
				Reservations: [
					{
						City: 'Gdansk',
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						Place: 12,
						Types: 'parkingPlace'
					}]
			};
			const freePlace = await res.findFreePlaceAsync(reservation, 'Gdansk', 'parking-dev');
			expect(freePlace).to.be.a('object').have.property('Id');
			expect(freePlace).have.property('City');
			expect(freePlace).have.property('Types', 'parkingPlace');
		});
		it('there are no places available', async () => {
			const reservation = {
				Id: '78b32460-287d-11e9-ae75-1578cdc7c640',
				Dates: '11022019',
				Reservations: [
					{
						City: 'Gdansk',
						Id: '6f89ddc0-287d-11e9-ab74-83664e1af428',
						Place: 11,
						Types: 'parkingPlace'
					},
					{
						City: 'Gdansk',
						Id: '78b32460-287d-11e9-ae75-1578cdc7c649',
						Place: 12,
						Types: 'parkingPlace'
					}]
			};
			const freePlace = await res.findFreePlaceAsync(reservation, 'Gdansk', 'parking-dev');
			expect(freePlace).equal(null);
		});
	});
});
