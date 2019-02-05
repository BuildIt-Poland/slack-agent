'use strict';
/* global describe it beforeEach afterEach*/
const expect = require('chai').expect;
const dynamoEnv = require('../communication/dynamoEnv.js');

describe('dynamoEnv module tests', function () {
	let val;
	describe('Check awsEnv() function', function () {
		beforeEach(function () {
			val=process.env.LOCAL_DB;
		});
    
		afterEach(function () {
			process.env.LOCAL_DB=val;
		});

		it('returns expected params for testing', async function () {
			process.env.LOCAL_DB='true';
			let params = dynamoEnv.awsEnv();
			expect(params.endpoint).to.equal('http://dynamodb:8000');
			expect(typeof params.credentials).to.equal('object');
			expect(params.region).to.equal('us-east-1');
		});
		it('returns expected params for prod', async function () {
			delete process.env.LOCAL_DB;
			let params = dynamoEnv.awsEnv();
			expect(typeof params.endpoint).to.equal('undefined');
			expect(typeof params.credentials).to.equal('undefined');
			expect(typeof params.region).to.equal('undefined');
		});
	});
});


