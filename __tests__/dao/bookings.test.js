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
  mockSave,
  mockQuery,
  restoreDynamoClientMock,
} = require('../../__mocks__/services/dbService.js');
const { parkingPalcesData } = require('../../__mocks__/data/parkingPlace.js');
const { bookingsData } = require('../../__mocks__/data/bookings.js');

describe.only('bookings.test.js', () => {
  afterEach(() => {
    restoreDynamoClientMock();
  });

  describe('Checks getBooking method', () => {
    it('returns booking for date and city', async () => {
      mockQuery(bookingsData.availableBooking);
      const booking = await getBooking('2020/03/01', 'WAW');

      expect(booking).toHaveProperty('City', 'WAW');
      expect(booking).toHaveProperty('BookingDate', '2020/03/01');
      expect(booking).toHaveProperty('Places');
    });
    it(`returns empty array when booking doesn't exist`, async () => {
      mockQuery();
      const booking = await getBooking('2020/03/01', 'WAW');

      expect(booking).toEqual({});
    });
  });

  describe('Checks bookingExists method', () => {
    it('returs true when booking exist', async () => {
      mockQuery(bookingsData.availableBooking);
      const doesExist = await bookingExists('2020/03/01', 'WAW');

      expect(doesExist).toEqual(true);
    });
    it(`returns false when booking doesn't exist`, async () => {
      mockQuery();
      const doesExist = await bookingExists('2020/03/01', 'WAW');

      expect(doesExist).toEqual(false);
    });
  });

  describe('Checks createBooking method', () => {
    beforeAll(() => {
      mockSave('City', 'BookingDate', 'Bookings-dev');
      mockQuery(parkingPalcesData);
    });

    it('returns true when booking created', async () => {
      const booking = await createBooking('2020/03/01', 'WAW', 'jon.robinson');

      expect(booking).toEqual(true);
    });
  });

  describe('Checks isBookingAvailableForPeriod method', () => {
    it('returns true when booking is available for period', async () => {
      mockQuery(bookingsData.availableBooking);
      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');

      expect(isAvailable).toEqual(true);
    });

    it('returns false when booking is unavailable for period', async () => {
      mockQuery(bookingsData.unavailableBooking);
      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');

      expect(isAvailable).toEqual(false);
    });
  });

  describe('Checks bookParkingPlace method', () => {
    beforeEach(() => {
      mockQuery(parkingPalcesData);
    });

    it('returns empty object when place booked', async () => {
      const booking = await bookParkingPlace('2020/03/01', 'WAW');

      expect(booking).toEqual({});
    });
  });

  describe('Checks unbookParkingPlace method', () => {
    beforeEach(() => {
      mockQuery(parkingPalcesData);
    });

    it('returns empty object when place unbooked', async () => {
      const booking = await unbookParkingPlace('2020/03/01', 'WAW');

      expect(booking).toEqual({});
    });
  });
});
