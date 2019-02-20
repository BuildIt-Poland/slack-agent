const AWS = require('aws-sdk');

exports.awsEnv = () => {
  let params = {};
  if (typeof process.env.LOCAL_DB !== 'undefined') {
    params = {
      endpoint: 'http://dynamodb:8000',
      credentials: new AWS.Credentials('123', '123'),
      region: 'us-east-1',
    };
  }
  return params;
};
