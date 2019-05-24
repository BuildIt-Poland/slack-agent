const HELP = '1. Check available locations\n`/agentlocations`\n\n2. Book a place\n `/agentbook 2030/01/30 Gotham`' +
  ' → to book a random place\n`/agentbook today Gotham 111` → to book a specific place\n\n3. Check your bookings:\n' +
  '`/agentmy`\n\n 4. Unbook if not needed:\n`/agentunbook tomorrow Gotham`';

const FAILURE = `${'Sorry, I didn’t quite get that :disappointed: I’m easily confused. Perhaps if you put the ' +
  'words in a different order? :brain:\n\nHow to use this bot in examples:\n'}${HELP}`;

const CAN_NOT_ADD_PARKING_PLACE = `You can't add parking place`;

const AUTHORIZE = `Authorized`;

const DELETE_RESERVATION = `Reservation deleted`;

const ALL_PLACES_BOOKED = `All parking places booked`;

const LOCATIONS = `Locations:`;

const MY_RESERVATIONS = `My reservations:`;

const LIST_OF_RESERVATIONS = `List of reservations with available places:`;

const AVAILABLE_PLACES = `Available places:`;

const PARKING_PLACE_IS_NOT_AVAILABLE = (placeId) => `Parking place ${placeId || ''} isn't available`;

const ADD_PARKING_PLACE = (city, placeId) => `You added a parking place.\n *City:* ${city}\n *Place:* ${placeId}`;

const CITY_DO_NOT_EXIST = (city) => `City ${city} doesn’t exist`;

const PARKING_PLACE_DO_NOT_EXIST = (placeId) => `Parking place ${placeId} doesn't exist`;

const BOOK_PARKING_PLACE = (placeId, city, dates) => `You booked a parking place ${placeId} in ${city} on ${dates}`;

module.exports = {
  HELP,
  FAILURE,
  CITY_DO_NOT_EXIST,
  PARKING_PLACE_DO_NOT_EXIST,
  PARKING_PLACE_IS_NOT_AVAILABLE,
  BOOK_PARKING_PLACE,
  CAN_NOT_ADD_PARKING_PLACE,
  ADD_PARKING_PLACE,
  AUTHORIZE,
  DELETE_RESERVATION,
  ALL_PLACES_BOOKED,
  AVAILABLE_PLACES,
  LIST_OF_RESERVATIONS,
  MY_RESERVATIONS,
  LOCATIONS
};
