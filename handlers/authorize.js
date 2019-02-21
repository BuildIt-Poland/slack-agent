const auth = require('../security/authorization.js');
const { success } = require('../utility/reponseBuilder.js');

const { CLIENT_ID, CLIENT_SECRET, CLIENT_SCOPES, ENV_STAGE } = require('../config/all.js');

module.exports.authorization = async event => {
  const params = {
    code: null,
    ...event.queryStringParameters,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    stage: ENV_STAGE,
  };

  if (!params.code) {
    return auth.oAuthRedirectUrl({
      ...event,
      scope: CLIENT_SCOPES,
      client_id: CLIENT_ID,
      stage: ENV_STAGE,
    });
  }

  await auth.authorize(params);
  return success(JSON.stringify({
    message: 'Authorized',
    input: event,
  }));
};
