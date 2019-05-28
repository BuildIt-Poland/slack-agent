const _ = require('lodash');
const moment = require('moment');
const momentRange = require('moment-range');

const DATE_FORMAT = 'YYYY/MM/DD';

const getDatesInRange = (dateMin, dateMax) => {
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

const isDateValid = date => {
  const dateMoment = moment(date, DATE_FORMAT);
  return dateMoment.isValid() && dateMoment.isSameOrAfter(moment(), 'date');
};

const parseDate = date => moment(date, DATE_FORMAT).format(DATE_FORMAT);

const parseCurrentDate = () => moment(moment(), DATE_FORMAT).format(DATE_FORMAT);

const parseTextToDate = (text) => ({
  'Tomorrow': moment(moment(), DATE_FORMAT).add(1, 'days').format(DATE_FORMAT),
  'Today': parseCurrentDate()
})[text] || text;

module.exports = {
  parseTextToDate,
  parseCurrentDate,
  parseDate,
  isDateValid,
  getDatesInRange
}
