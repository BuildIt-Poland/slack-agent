const _ = require('lodash');
const queryString = require('query-string');

exports.parseBodyToObject = (body, objectFormatParse) => {
  const parsedBody = queryString.parse(body);
  const textArray = _.split(parsedBody.text, ' ');
  const textObject = _.reduce(_.keys(objectFormatParse), (acc, key, index) => 
    ({...acc, [key]: textArray[index]}), 
    _.has(objectFormatParse, 'userName') ? {} : { userName: bodyParse.user_name });
  const isTextObjectValid = isObjectTextValid(textObject, objectFormatParse);
  return isTextObjectValid ? {
    isValid: isTextObjectValid,
    message: textObject
  } : {
    isValid: isTextObjectValid,
    message: 'Invalid command'
  }
}

const isObjectTextValid = (textObject, objectWithValidations) => {
  return _.every(_.map(_.keys(objectWithValidations), (key) => validateObjectTextProperty(objectWithValidations[key],textObject[key])));
}

const validateObjectTextProperty = (validationForProperty, textObjectProperty) => {
  return _.every(_.values(validationForProperty), validation => validation(textObjectProperty));
}