const moment = require('moment');
const _ = require('lodash');

exports.isFutureDate = (date) => {
    const formatDate = _.replace(date, new RegExp('/', 'g'), '-')
    return moment(formatDate).isSameOrAfter(moment(), 'date');
}

exports.isCity = (city) => {
    return /^[a-zA-Z]+$/.test(city)
};
