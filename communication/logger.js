const log = require('npmlog');
const moment = require('moment');
const util = require('util');
log.addLevel('debug', 1500, { fg: 'blue', bg: 'black' }, 'debug');
log.level = 'debug';

module.exports.debug = (func, ...args) => {
	log.heading = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
	log.debug(func, util.format(...args));
};

module.exports.info = (func, ...args) => {
	log.heading = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
	log.info(func, util.format(...args));
};


module.exports.warn = (func, ...args) => {
	log.heading = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
	log.warn(func, util.format(...args));
    
};

module.exports.error = (func, ...args) => {
	log.heading = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
	log.error(func, util.format(...args));
};

module.exports.fatal = (func, ...args) => {
	log.heading = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
	log.fatal(func, util.format(...args));
};


