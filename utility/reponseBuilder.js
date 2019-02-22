exports.success = (body) => ({
  statusCode: 200,
  body,
});

exports.internalServerError = () => ({
  statusCode: 500,
});

exports.unauthorized = () => ({
  statusCode: 401,
});

exports.redirect = (location) => ({
  statusCode: 301,
  headers: {
    location
  },
});
