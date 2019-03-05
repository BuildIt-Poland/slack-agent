const log = require('npmlog');
const logger = require('../../app/services/loggerService.js');

jest.mock('npmlog');

describe('loggerService.test.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debug() passes basic data', () => {
    logger.debug('function', 'messages');

    expect(log.log).toBeCalledTimes(1);
    expect(log.log).toBeCalledWith('debug', 'function', 'messages');
  });

  it('info() passes basic data and concatanates one param', () => {
    logger.info('function', 'messages: %s', true);

    expect(log.log).toBeCalledTimes(1);
    expect(log.log).toBeCalledWith('info', 'function', 'messages: true');
  });

  it('warn() passes basic data and concatanates many params', () => {
    logger.warn('function', 'messages %s %s %s', 'are', true, 111);

    expect(log.log).toBeCalledTimes(1);
    expect(log.log).toBeCalledWith('warn', 'function', 'messages are true 111');
  });

  it('error() works with only function name as param', () => {
    logger.error('function', 'args');

    expect(log.log).toBeCalledTimes(1);
    expect(log.log).toBeCalledWith('error', 'function', 'args');
  });

  it('error works with no params passes basic data', () => {
    logger.error();

    expect(log.log).toBeCalledTimes(1);
    expect(log.log).toBeCalledWith('error', undefined, '');
  });
});
