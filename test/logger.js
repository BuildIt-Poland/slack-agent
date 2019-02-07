'use strict';
/* global describe it beforeEach afterEach */
const expect = require('chai').expect;
const logger = require('../communication/logger.js');
const log = require('npmlog');
require('mocha-sinon');



describe('privateFunction()', function() {

	beforeEach(function() {
		this.sinon.stub(log, 'log');
	});
    
	afterEach(function() {
		this.sinon.restore();
	});

	it('debug() passes basic data', function() {
		logger.debug('function', 'messages');
		expect( log.log.calledOnce ).to.be.true;
		expect( log.log.calledWith('debug', 'function', 'messages') ).to.be.true;
	});
    
	it('info() passes basic data and concatanates one param', function() {
		logger.info('function', 'messages: %s', true);
		expect( log.log.calledOnce ).to.be.true;
		expect( log.log.calledWith('info', 'function', 'messages: true') ).to.be.true;
	});

	it('warn() passes basic data and concatanates many params', function() {
		logger.warn('function', 'messages %s %s %s', 'are', true, 111);
		expect( log.log.calledOnce ).to.be.true;
		expect( log.log.calledWith('warn', 'function', 'messages are true 111') ).to.be.true;
	});

	it('error() works with only function name as param', function() {
		logger.error('function');
		expect( log.log.calledOnce ).to.be.true;
		expect( log.log.calledWith('error', 'function') ).to.be.true;
	});

	it('error works with no params passes basic data', function() {
		logger.error();
		expect( log.log.calledOnce ).to.be.true;
		expect( log.log.calledWith('error') ).to.be.true;
	});

   

});