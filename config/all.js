exports.CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
exports.CLIENT_ID = process.env.SLACK_CLIENT_ID;
exports.CLIENT_SCOPES = process.env.SLACK_CLIENT_SCOPES;
exports.SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
exports.PARKING_PLACES_TABLE = process.env.PARKING_PLACES_TABLE || 'ParkingPlaces-dev';
exports.BOOKINGS_TABLE = process.env.BOOKINGS_TABLE || 'Bookings-dev';
exports.ENV_STAGE = process.env.ENV_STAGE;
