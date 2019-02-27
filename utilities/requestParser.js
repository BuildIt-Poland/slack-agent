const _ = require('lodash');
const queryString = require('query-string');

const isParamValid = (inputParam, paramValidators) =>
  _.every(_.values(paramValidators), validate => validate(inputParam));

const validateInputParams = (inputParams, inputFormat) =>
  _.reduce(
    inputParams,
    (isValid, userInputProperty, propertyKey) =>
      isParamValid(userInputProperty, inputFormat[propertyKey]) && isValid,
    true,
  );

exports.parseBodyToObject = (body, inputFormat) => {
  const parsedBody = queryString.parse(body);
  const inputParamsList = _.split(parsedBody.text, ' ');

  const inputParams = _.reduce(
    _.keys(inputFormat),
    (params, paramName, index) => ({ ...params, [paramName]: inputParamsList[index] }),
    {},
  );

  if (_.has(inputFormat, 'userName')) {
    inputParams.userName = parsedBody.user_name;
  }

  const isValid = validateInputParams(inputParams, inputFormat);
  return {
    isValid,
    message: isValid ? inputParams : 'Invalid command',
  };
};
