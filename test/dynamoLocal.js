'use strict';
/* global describe it beforeEach afterEach */
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');
const dynamoLocal = require('../development/dynamoLocal.js');

describe('DynamoLocal module tests', function () {
	describe('Check configure() function', function () {
		beforeEach(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				if(typeof params.TableName != 'undefined' && params.TableName == 'parking-dev' && typeof params.Item.Types != 'undefined')
					callback(null, 'successfully put item in database');
				else
					callback({error: 'document big one'}, 'failed to put data in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				if(typeof params.TableName != 'undefined' && params.TableName == 'parking-dev')
					callback(null, 'successfully created table in database');
				else
					callback({error: 'table big one'}, 'failed to create table in database');
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
describe('DynamoLocal failures module tests', function () {
	describe('Check configure() function', function () {
		beforeEach(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				callback({error: 'document big one'}, 'failed to put data in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				callback({error: 'table big one'}, 'failed to create table in database');
			});
		});
    
		afterEach(function () {
			AWS.restore('DynamoDB');
			AWS.restore('DynamoDB.DocumentClient');
		});

		it('returns false due to table error', async function () {
			let status = await dynamoLocal.configure();
			expect(status).to.equal(false);
		});
	});
});
describe('DynamoLocal failures module tests', function () {
	describe('Check configure() function', function () {
		beforeEach(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				callback({error: 'document big one'}, 'failed to put data in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				callback(null, 'successfully created table in database');
			});
		});
    
		afterEach(function () {
			AWS.restore('DynamoDB');
			AWS.restore('DynamoDB.DocumentClient');
		});

		it('returns false due to put error', async function () {
			let status = await dynamoLocal.configure();
			expect(status).to.equal(false);
		});
	});
});

