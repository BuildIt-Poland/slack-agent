const { isVerified } = require('../services/authService.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { generateResponseBodyWithAttachments } = require('../utilities/responseBody.js');

const { HELP } = require('../utilities/responseMessages.js');
const { ENV_STAGE, SIGNING_SECRET } = require('../../config/all.js');


module.exports.help = async event => {
  if (!(await isVerified(event, SIGNING_SECRET, ENV_STAGE))) {
    return unauthorized();
  }

  return success(generateResponseBodyWithAttachments(HELP));
};
