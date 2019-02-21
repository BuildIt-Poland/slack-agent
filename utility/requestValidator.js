const moment = require('moment');
const _ = require('lodash');

exports.isFeatureDate = (date) => {
    const formatDate = _.replace(date, '/', '-');
    return moment(formatDate).isSameOrAfter(moment(), 'date'); 
} 

exports.isCity = (city) => {
    return /^(?:[A-Za-z]{2,}(?:(\.\s|'s\s|\s?-\s?|\s)?(?=[A-Za-z]+))){1,2}(?:[A-Za-z]+)?$/.test(city)
};
