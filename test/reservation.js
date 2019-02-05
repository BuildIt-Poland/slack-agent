/* globals describe, beforeEach, afterEach, it */
'use strict';
const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;
const res = require('../workers/reservation.js');

describe('Reservation module tests',  () => {
	describe('Check findReservationByDateAsync(date, tableName)', () => {
		beforeEach(async () => {
			AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => { 
				callback(null, { Items: []}); 
			});
		});
		afterEach(() => {
			AWS.restore('DynamoDB.DocumentClient');
		});
		it('returns reservation for specific date', async () => {
			const reservation = await res.findReservationByDateAsync('02030232', 'parking-dev');
			expect(reservation).to.equals(undefined);
		});
	});
});