const _ = require('lodash');
const { oAuthRedirectUrl, authorize } = require('../services/authService.js');
const { success, redirect } = require('../utilities/reponseBuilder.js');

const { CLIENT_ID, CLIENT_SECRET, CLIENT_SCOPES, ENV_STAGE } = require('../config/all.js');

module.exports.authorize = async (event) => {
  if (ENV_STAGE === 'dev') {
    return success('Dev environment - no security.');
  }

  if (!_.has(event.queryStringParameters, 'code')) {
    return redirect(
      oAuthRedirectUrl({
        ...event,
        scope: CLIENT_SCOPES,
        client_id: CLIENT_ID,
        stage: ENV_STAGE
      })
    );
  }

  await authorize({
    code: event.queryStringParameters.code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    stage: ENV_STAGE
  });

  return success('Authorized');
};
