/* global describe it beforeEach afterEach */
const { expect } = require('chai');
const log = require('npmlog');
const logger = require('../services/loggerService.js');
require('mocha-sinon');

describe('privateFunction()', () => {
  beforeEach(function initLogStub() {
    this.sinon.stub(log, 'log');
  });

  afterEach(function restoreLogStub(){
    this.sinon.restore();
  });

  it('debug() passes basic data', () => {
    logger.debug('function', 'messages');
    expect(log.log.calledOnce).to.equals(true);
    expect(log.log.calledWith('debug', 'function', 'messages')).to.equals(true);
  });

  it('info() passes basic data and concatanates one param', () => {
    logger.info('function', 'messages: %s', true);
    expect(log.log.calledOnce).to.equals(true);
    expect(log.log.calledWith('info', 'function', 'messages: true')).to.equals(true);
  });

  it('warn() passes basic data and concatanates many params', () => {
    logger.warn('function', 'messages %s %s %s', 'are', true, 111);
    expect(log.log.calledOnce).to.equals(true);
    expect(log.log.calledWith('warn', 'function', 'messages are true 111')).to.equals(true);
  });

  it('error() works with only function name as param', () => {
    logger.error('function');
    expect(log.log.calledOnce).to.equals(true);
    expect(log.log.calledWith('error', 'function')).to.equals(true);
  });

  it('error works with no params passes basic data', () => {
    logger.error();
    expect(log.log.calledOnce).to.equals(true);
    expect(log.log.calledWith('error')).to.equals(true);
  });
});
