const _ = require('lodash');
const queryString = require('query-string');
const { isDateValid, getDatesInRange, parseDate } = require('../services/dateService.js');

const FAILURE_MESSAGE = `Sorry, I didn’t quite get that :disappointed: I’m easily confused. Perhaps if you put
  the words in a different order? :brain:\n\nExamples:\n• /agentlocations → to list available locations\n•
  /agentbook 2030/05/24 GDN → to book a random place\n• /agentbook 2030/05/24 GDN 44 → to book a specific place`

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
  const [minDate, maxDate] = _.split(dates, '-');
  if (!maxDate) {
    return isDateValid(minDate) ? [parseDate(minDate)] : [];
  }
  return isDateValid(minDate) && isDateValid(maxDate) ? getDatesInRange(minDate, maxDate) : [];
};

exports.parseBodyToObject = (body, inputFormat) => {
  const parsedBody = queryString.parse(body);
  const inputParamsList = _.split(parsedBody.text, ' ');

  const inputParams = _.reduce(
    _.keys(inputFormat),
    (params, paramName, index) => ({ ...params, [paramName]: inputParamsList[index] }),
    {},
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
    message: isValid ? inputParams : FAILURE_MESSAGE
  };
};
