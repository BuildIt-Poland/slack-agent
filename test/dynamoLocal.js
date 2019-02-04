'use strict';
/* global describe it beforeEach afterEach */
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');
const dynamoLocal = require('../development/dynamoLocal.js');

describe('DynamoLocal module tests', function () {
	describe('Check configure() function', function () {
		beforeEach(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				callback(null, 'successfully put item in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				callback(null, 'successfully created table in database');
			});
		});
    
		afterEach(function () {
			AWS.restore('DynamoDB');
			AWS.restore('DynamoDB.DocumentClient');
		});

		it('returns true', async function () {
			let status = await dynamoLocal.configure();
			expect(status).to.equal(true);
		});
	});
});

