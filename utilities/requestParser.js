const _ = require('lodash');
const moment = require('moment');
const momentRange = require('moment-range');
const queryString = require('query-string');

const isParamValid = (inputParam, paramValidators) =>
  _.every(_.values(paramValidators), (validate) => validate(inputParam));

const validateInputParams = (inputParams, inputFormat) =>
  _.reduce(
    inputParams,
    (isValid, userInputProperty, propertyKey) =>
      isParamValid(userInputProperty, inputFormat[propertyKey]) && isValid,
    true
  );

const getDatesBetween = (minDate, maxDate) => {
  const min = moment(minDate, 'YYYY/MM/DD');

  const max = moment(maxDate, 'YYYY/MM/DD');

  if (
    !min.isValid() &&
    !max.isValid() &&
    !min.isSameOrAfter(moment(), 'date') &&
    !max.isSameOrAfter(moment(), 'date')
  ) {
    return [];
  }
  return _.map(
    min.isSameOrBefore(max)
      ? [ ...momentRange.extendMoment(moment).range(min, max).reverseBy('days') ]
      : [ ...momentRange.extendMoment(moment).range(max, min).reverseBy('days') ],
    (m) => m.format('YYYY/MM/DD')
  );
};

const parseDatesToArray = (dates) => {
  const [ minDate, maxDate ] = _.split(dates, '-');
  if (!maxDate) {
    const min = moment(minDate, 'YYYY/MM/DD');
    return min.isValid && min.isSameOrAfter(moment(), 'date') ? [ min.format('YYYY/MM/DD') ] : [];
  }
  return getDatesBetween(minDate, maxDate);
};

exports.parseBodyToObject = (body, inputFormat) => {
  const parsedBody = queryString.parse(body);
  const inputParamsList = _.split(parsedBody.text, ' ');

  const inputParams = _.reduce(
    _.keys(inputFormat),
    (params, paramName, index) => ({ ...params, [paramName]: inputParamsList[index] }),
    {}
  );

  if (_.has(inputParams, 'dates')) {
    inputParams.dates = parseDatesToArray(inputParams.dates);
  }

  if (_.has(inputFormat, 'userName')) {
    inputParams.userName = parsedBody.user_name;
  }

  const isValid = validateInputParams(inputParams, inputFormat);
  return {
    isValid,
    message: isValid ? inputParams : 'Invalid command'
  };
};
