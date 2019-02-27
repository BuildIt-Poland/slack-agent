const _ = require('lodash');
const { getParkingPlaces } = require('./parkingPlace.js');
const { query, save, update } = require('../services/dbService.js');

const { BOOKINGS_TABLE } = require('../config/all.js');

// const isBookingAvailableForPeriod = (bookingDates, city) => {
//   // bookingDates: [2020/03/02, 2020/03/03, 2020/03/04];
//   const minDate =
//   const maxDate =

//   const params = {
//     KeyConditionExpression:
//       'City = :city and BookingDate between :minDate and :maxDate',
//     ExpressionAttributeValues: {
//       ':city': 'GDN',
//       ':minDate': minDate,
//       ':maxDate': maxDate,
//     },
//   };

//   const { Items } = await query(params, BOOKINGS_TABLE);

//   _.every(Items, )
// };

const getBooking = async (bookingDate, city) => {
  const params = {
    KeyConditionExpression: 'City=:city and BookingDate = :bookingDate',
    ExpressionAttributeValues: {
      ':bookingDate': bookingDate,
      ':city': city,
    },
  };

  const { Items } = await query(params, BOOKINGS_TABLE);
  return Items[0] || {};
};

const bookingExists = async (bookingDate, city) => !_.isEmpty(await getBooking(bookingDate, city));

const createBooking = async (bookingDate, city, userName) => {
  const parkingPlaces = _.map(await getParkingPlaces(city), ({ PlaceID }, index) => ({
    PlaceID,
    Owner: index === 0 ? userName : 'free',
  }));

  return save(
    {
      City: city,
      BookingDate: bookingDate,
      Places: parkingPlaces,
    },
    BOOKINGS_TABLE,
  );
};

const bookParkingPlace = async (bookingDate, city, userName) => {
  const { Places: places } = await getBooking(bookingDate, city);
  const freePlaceIndex = _.findIndex(places, { Owner: 'free' });
  places[freePlaceIndex].Owner = userName;

  const params = {
    Key: {
      City: city,
      BookingDate: bookingDate,
    },
    UpdateExpression: 'set Places = :places',
    ExpressionAttributeValues: {
      ':places': places,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  return update(params, BOOKINGS_TABLE);
};

module.exports({
  bookingExists,
  bookParkingPlace,
  createBooking,
  getBooking,
  isBookingAvailableForPeriod,
});
