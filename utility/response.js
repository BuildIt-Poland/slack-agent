const _ = require('lodash');

exports.responseBody = (text) => {
    return `{"text": "${text}"}`;
};
  
exports.responseBodyWithAttachments = (title, attachments) => {
    return `{"text": "${title}", 
        "attachments" : ${JSON.stringify(_.map(attachments, (attachment) => 
            ({ text: _.map(_.keys(attachment), (key) => attachment[key] || attachment[key] !== '' ? `*${key}:* ${attachment[key]}\n` : '')
            .join( '')})))}}`;
};
  