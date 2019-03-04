/* global describe it beforeEach afterEach */
const {
  getBooking,
  bookingExists,
  createBooking,
  isBookingAvailableForPeriod,
  bookParkingPlace,
  unbookParkingPlace,
} = require('../../app/dao/bookings.js');
const {
  saveBooking,
  query,
  restoreDynamoClient,
  PARKING_PLACES,
  BOOKING,
} = require('../../__mocks__/services/dbService.js');

describe.only('bookings.test.js', () => {
  afterEach(() => {
    restoreDynamoClient();
  });
  describe('Checks getBooking method', () => {
    it('returns booking for date and city', async () => {
      query(BOOKING.availableBooking);
      const booking = await getBooking('2020/03/01', 'WAW');
      expect(booking).toHaveProperty('City', 'WAW');
      expect(booking).toHaveProperty('BookingDate', '2020/03/01');
      expect(booking).toHaveProperty('Places');
    });
    it(`returns empty array when booking doesn't exist`, async () => {
      query();
      const booking = await getBooking('2020/03/01', 'WAW');
      expect(booking).toEqual({});
    });
  });
  describe('Checks bookingExists method', () => {
    it('returs true when booking exist', async () => {
      query(BOOKING.availableBooking);
      const isBooking = await bookingExists('2020/03/01', 'WAW');
      expect(isBooking).toEqual(true);
    });
    it(`returns false when booking doesn't exist`, async () => {
      query();
      const isBooking = await bookingExists('2020/03/01', 'WAW');
      expect(isBooking).toEqual(false);
    });
  });
  describe('Checks createBooking method', () => {
    beforeAll(() => {
      saveBooking('database error');
      query(PARKING_PLACES);
    });
    it('returns true when booking created', async () => {
      const booking = await createBooking('2020/03/01', 'WAW', 'jon.robinson');
      expect(booking).toEqual(true);
    });
  });
  describe('Checks isBookingAvailableForPeriod method', () => {
    it('returns true when booking is available for period', async () => {
      query(BOOKING.availableBooking);
      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');
      expect(isAvailable).toEqual(true);
    });
    it('returns false when booking is unavailable for period', async () => {
      query(BOOKING.unavailableBooking);
      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');
      expect(isAvailable).toEqual(false);
    });
  });
  describe('Checks bookParkingPlace method', () => {
    beforeEach(() => {
      query(PARKING_PLACES);
    });
    it('returns empty object when place booked', async () => {
      const booking = await bookParkingPlace('2020/03/01', 'WAW');
      expect(booking).toEqual({});
    });
    it('returns empty object when place unbooked', async () => {
      const booking = await unbookParkingPlace('2020/03/01', 'WAW');
      expect(booking).toEqual({});
    });
  });
});
