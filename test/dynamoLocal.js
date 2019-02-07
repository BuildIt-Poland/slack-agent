'use strict';
/* global describe it before after beforeEach afterEach */
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');
const dynamoLocal = require('../development/dynamoLocal.js');
const log = require('npmlog');
require('mocha-sinon');

describe('DynamoLocal module tests', function () {
	describe('Check configure() function', function () {
		before(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				if(typeof params.TableName == 'undefined')
					callback({error: 'typeof params.TableName == \'undefined\''}, 'failed to put data in database');
				else if (params.TableName != 'parking-dev')
					callback({error: 'params.TableName != \'parking-dev\''}, 'failed to put data in database');
				else if (typeof params.Item.Types == 'undefined')
					callback({error: 'typeof params.Item.Types == \'undefined\''}, 'failed to put data in database');
				else
					callback(null, 'successfully put item in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				if(typeof params.TableName == 'undefined')
					callback({error: 'typeof params.TableName == \'undefined\''}, 'failed to create table in database');
				else if(params.TableName != 'parking-dev')
					callback({error: 'params.TableName != \'parking-dev\''}, 'failed to create table in database');
				else
					callback(null, 'successfully created table in database');
			});
		});
    
		after(function () {
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
	beforeEach(function() {
		this.sinon.stub(log, 'log');
	});
    
	afterEach(function() {
		this.sinon.restore();
	});

	describe('Check configure() function', function () {
		before(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				callback({error: 'document big one'}, 'failed to put data in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				callback({error: 'table big one'}, 'failed to create table in database');
			});
		});
    
		after(function () {
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
	beforeEach(function() {
		this.sinon.stub(log, 'log');
	});
    
	afterEach(function() {
		this.sinon.restore();
	});

	describe('Check configure() function', function () {
		before(function () {
			AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
				callback({error: 'document big one'}, 'failed to put data in database');
			});
			AWS.mock('DynamoDB', 'createTable', function (params, callback){
				callback(null, 'successfully created table in database');
			});
		});
    
		after(function () {
			AWS.restore('DynamoDB');
			AWS.restore('DynamoDB.DocumentClient');
		});

		it('returns false due to put error', async function () {
			let status = await dynamoLocal.configure();
			expect(status).to.equal(false);
		});
	});
});

