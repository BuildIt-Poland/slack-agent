'use strict';
/* global describe it beforeEach afterEach */
const expect = require('chai').expect;
const handler = require('../handler.js');
const auth = require('../security/authorization.js');
const parkingPlace = require('../workers/parkingPlace.js');
const slackMessages = require('../communication/slackMessages.js');
const res = require('../workers/reservation.js');
require('mocha-sinon');



describe('handler methods positive paths', async function() {
	let stubAuth;
	let stubVerified;
	beforeEach(function() {
		stubAuth = this.sinon.stub(auth, 'authorize');
		stubAuth.returns({
			status: 200,
			response: 
            { url: 'url.com', data: {}},
		});
		stubVerified = this.sinon.stub(auth, 'isVerified');
		stubVerified.returns(true);
	});
    
	afterEach(function() {
		stubAuth.restore();
		stubVerified.restore();
	});

	it('authorization() returns 200 if code is filled in event', async function() {
		let obj = await handler.authorization({queryStringParameters: {code: 234}});
		expect(obj.statusCode).to.equal(200);
	});

	it('authorization() returns expected json if code is filled in event', async function() {
		let obj = await handler.authorization({queryStringParameters: {code: 234}});
		expect(typeof obj.body).not.equal('undefined');
		expect(obj.body.indexOf('Authorized')).not.equal(-1);
		expect(obj.body.indexOf('code')).not.equal(-1);
	});
    
	it('authorization() returns 301 if code is missing in event', async function() {
		let obj = await handler.authorization({queryStringParameters: {}});
		expect( obj.statusCode ).to.equal( 301 );
	});
    
	it('authorization() returns returns expected json if code is missing in event', async function() {
		let obj = await handler.authorization({queryStringParameters: '?dummy=field'});
		expect(typeof obj.headers.Location).not.equal('undefined');
		expect(obj.headers.Location.indexOf('https://slack.com/oauth/authorize')).not.equal(-1);
		expect(obj.headers.Location.indexOf('field')).not.equal(-1);
	});
    

});