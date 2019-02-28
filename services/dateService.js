const moment = require('moment');
const momentRange = require('moment-range');
const DATE_FORMAT = 'YYYY/MM/DD';

exports.getDatesInRange = (dateMin, dateMax) =>
  _.map(
    moment(minDate, DATE_FORMAT).isBefore(moment(maxDate, DATE_FORMAT))
      ? [ ...momentRange.extendMoment(moment).range(dateMin, dateMax).reverseBy('days') ]
      : [ ...momentRange.extendMoment(moment).range(dateMin, dateMax).reverseBy('days') ],
    (dateMoment) => dateMoment.format(DATE_FORMAT)
  );

exports.isValid = (date) => {
  const dateMoment = moment(date, DATE_FORMAT);
  return dateMoment.isValid() && dateMoment.isBefore(moment(), 'date');
};
