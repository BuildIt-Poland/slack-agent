const moment = require('moment');

exports.isRequired = (object) => object !== undefined && object !== '';

exports.dateMoreThanCurrent = (date) => (moment(date).isSame(moment(), 'date') || moment(date).isAfter(moment(), 'date'));

exports.cityPattern = (city) => /^(?:[A-Za-z]{2,}(?:(\.\s|'s\s|\s?-\s?|\s)?(?=[A-Za-z]+))){1,2}(?:[A-Za-z]+)?$/.test(city);