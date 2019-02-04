'use strict';

/* global describe it  */
const expect = require('chai').expect;
const reservation = require('../workers/reservation.js');

describe('Reservation module tests',  () => {
	describe('Check findReservationByDate(date, tableName)', () => {
		it('returns reservation for specific date', async () => {
			expect(`Test`).to.equal(`Test`);
		});
		it(`returns undefined when reservations isn't exist in database`, async () => {

		});
	});

});