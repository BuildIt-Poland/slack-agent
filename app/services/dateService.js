const _ = require('lodash');
const moment = require('moment');
const momentRange = require('moment-range');

const DATE_FORMAT = 'YYYY/MM/DD';

exports.getDatesInRange = (dateMin, dateMax) => {
  const min = moment(dateMin, DATE_FORMAT);
  const max = moment(dateMax, DATE_FORMAT);
  return _.map(
    max.isSameOrAfter(min)
      ? [
          ...momentRange
            .extendMoment(moment)
            .range(min, max)
            .reverseBy('days'),
        ]
      : [
          ...momentRange
            .extendMoment(moment)
            .range(max, min)
            .reverseBy('days'),
        ],
    dateMoment => dateMoment.format(DATE_FORMAT),
  );
};

exports.isDateValid = date => {
  const dateMoment = moment(date, DATE_FORMAT);
  return dateMoment.isValid() && dateMoment.isSameOrAfter(moment(), 'date');
};

exports.parseDate = date => moment(date, DATE_FORMAT).format(DATE_FORMAT);

exports.parseCurrentDate = () => moment(moment(), DATE_FORMAT).format(DATE_FORMAT);
