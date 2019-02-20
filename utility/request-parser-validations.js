const moment = require('moment');
const _ = require('lodash');

exports.isRequired = (object) => {
    return object !== undefined && object !== '';
}

exports.dateMoreThanCurrent = (date) => {
    const formatDate = _.replace(date, '/', '-');
    return moment(formatDate).isSame(moment(), 'date') || moment(formatDate).isAfter(moment(), 'date');
} 

exports.cityPattern = (city) => {
    return /^(?:[A-Za-z]{2,}(?:(\.\s|'s\s|\s?-\s?|\s)?(?=[A-Za-z]+))){1,2}(?:[A-Za-z]+)?$/.test(city)
};