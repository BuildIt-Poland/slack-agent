const _ = require('lodash');
const moment = require('moment');
const queryString = require('query-string');
const { isValid, DATE_FORMAT, getDatesInRange } = require('../services/dateService.js');

const isParamValid = (inputParam, paramValidators) =>
  _.every(_.values(paramValidators), (validate) => validate(inputParam));

const validateInputParams = (inputParams, inputFormat) =>
  _.reduce(
    inputParams,
    (isValid, userInputProperty, propertyKey) =>
      isParamValid(userInputProperty, inputFormat[propertyKey]) && isValid,
    true
  );

const parseDatesToArray = (dates) => {
  const [ minDate, maxDate ] = _.split(dates, '-');
  if (!maxDate) {
    return isValid(min) ? [ moment(minDate, DATE_FORMAT).format(DATE_FORMAT) ] : [];
  }
  return isValid(min) && isValid(max) ? getDatesInRange(min, max) : [];
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
