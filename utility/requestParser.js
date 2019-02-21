const _ = require('lodash');
const queryString = require('query-string');

const isTextPropertyValid = (textProperty, validationForProperty) => {;
  return  _.every(_.values(validationForProperty), validation => validation(textProperty));
}

const isTextValid = (text, validations) => {
  return _.reduce(text, (isObjectValid, userInputProperty, propertyKey) => 
    (isTextPropertyValid(userInputProperty, validations[propertyKey]) && isObjectValid), true);
}

exports.parseBodyToObject = (body, textFormat) => {
  const parsedBody = queryString.parse(body);
  const textArray = _.split(parsedBody.text, ' ');
  const text = _.reduce(_.keys(textFormat), (acc, key, index) => 
    ({...acc, [key]: textArray[index]}), 
    _.has(textFormat, 'userName') ? { userName: parsedBody.user_name } : {});
  const isValid = isTextValid(text, textFormat);
  return {
    isValid,
    message: isValid ? text : 'Invalid command'
  }
}
