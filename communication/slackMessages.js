const _ = require('lodash');
const queryString = require('query-string');

function paramsValidation(object, params, index) {
  return Object.values(object).every(fn => fn(params[index], params, index));
}

function isObjectValid(object) {
  return Object.values(object).every(props => props.isValid);
}

function createValidatedObject(object) {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: object[key].value }), {});
}

function parseMessageFromSlack(payload, object) {
  const bodyParams = queryString.parse(payload.body);
  const params = bodyParams.text.split(' ');
  const parsedTextMessage = Object.keys(object).reduce(
    (acc, key, index) => ({
      ...acc,
      [key]: { value: params[index], isValid: paramsValidation(object[key], params, index) },
    }),
    {},
  );
  return _.has(object, 'userName')
    ? {
        ...parsedTextMessage,
        userName: { value: bodyParams.user_name, isValid: true },
      }
    : parsedTextMessage;
}

exports.slackMessageValidate = (payload, object) => {
  const parsedObject = parseMessageFromSlack(payload, object);
  const isValid = isObjectValid(parsedObject);
  return isValid
    ? {
        isValidCommand: isValid,
        message: createValidatedObject(parsedObject),
      }
    : {
        isValidCommand: isValid,
        message: 'Invalid command',
      };
};


exports.slackDefaultMessage = message => {
  return `{"text": "${message}"}`;
};

exports.slackDefaultMessage = message => `{"text": "${message}"}`;

exports.listSlackMessage = (records, title) => {
  const attachments = records.map(record => {
    const textArray = Object.keys(record).map(key =>
      record[key] || record[key] !== '' ? `*${key}:* ${record[key]}\n` : '',
    );
    return { text: textArray.join('') };
  });
  return `{"text": "${title}", "attachments" : ${JSON.stringify(attachments)}}`;
};
