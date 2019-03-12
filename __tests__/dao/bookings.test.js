jest.mock('../../app/dao/parkingPlace.js');
jest.mock('../../app/services/dbService.js');
jest.mock('../../app/services/dateService.js');

const { getParkingPlaces } = require('../../app/dao/parkingPlace.js');
const {
  getBooking,
  bookingExists,
  createBooking,
  isBookingAvailableForPeriod,
  bookParkingPlace,
  unbookParkingPlace,
  updateBookingWithOwner,
  getFutureBookings,
} = require('../../app/dao/bookings.js');
const { query, save, update } = require('../../app/services/dbService.js');
const { parseCurrentDate } = require('../../app/services/dateService.js');

const bookingDataMock = owner => ({
  Items: [
    {
      Places: [
        {
          Owner: owner,
        },
      ],
    },
  ],
});

describe.only('bookings.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Checks getBooking method', () => {
    it('returns booking for date and city', async () => {
      query.mockImplementation(() => ({
        Items: ['booking'],
      }));

      const booking = await getBooking('2020/03/01', 'WAW');

      expect(booking).toEqual('booking');
    });

    it(`returns empty object when booking doesn't exist`, async () => {
      query.mockImplementation(() => ({
        Items: [],
      }));

      const booking = await getBooking('2020/03/01', 'WAW');

      expect(booking).toEqual({});
    });
  });

  describe('Checks bookingExists method', () => {
    it('returs true when booking exist', async () => {
      query.mockImplementation(() => ({
        Items: ['booking'],
      }));

      const doesExist = await bookingExists('2020/03/01', 'WAW');

      expect(doesExist).toEqual(true);
    });

    it(`returns false when booking doesn't exist`, async () => {
      query.mockImplementation(() => ({
        Items: [],
      }));

      const doesExist = await bookingExists('2020/03/01', 'WAW');

      expect(doesExist).toEqual(false);
    });
  });

  describe('Checks createBooking method', () => {
    it('returns true when booking created', async () => {
      save.mockImplementation(() => true);
      getParkingPlaces.mockImplementation(() => [
        {
          PlaceID: '1',
        },
        {
          PlaceID: '2',
        },
      ]);

      const booking = await createBooking('2020/03/01', 'WAW', 'jon.robinson');

      expect(booking).toEqual(true);
    });
  });

  describe('Checks isBookingAvailableForPeriod method', () => {
    it('returns true when booking is available for period', async () => {
      query.mockImplementation(() => bookingDataMock('free'));

      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');

      expect(isAvailable).toEqual(true);
    });

    it('returns false when booking is unavailable for period', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo'));

      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');

      expect(isAvailable).toEqual(false);
    });
  });

  describe('Checks bookParkingPlace method', () => {
    beforeAll(() => {
      update.mockImplementation(() => 'updated booking');
    });

    it('returns updated booking when place booked', async () => {
      query.mockImplementation(() => bookingDataMock('free'));

      const updatedBooking = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual('updated booking');
    });

    it('returns empty object when the reservation is unavailable', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo'));

      const updatedBooking = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual({});
    });
  });

  describe('Checks unbookParkingPlace method', () => {
    beforeAll(() => {
      update.mockImplementation(() => 'updated booking');
    });

    it('returns updated booking without booking place', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo'));

      const updatedBooking = await unbookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual('updated booking');
    });

    it(`returns empty object when reservation doesn't exist`, async () => {
      query.mockImplementation(() => bookingDataMock('free'));

      const updatedBooking = await unbookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual({});
    });
  });

  describe('Checks updateBookingWithOwner method', () => {
    beforeAll(() => {
      update.mockImplementation(() => 'updated booking');
    });

    it('return updated booking with reservation for appropriate user', async () => {
      query.mockImplementation(() => bookingDataMock('free'));

      const updatedBooking = await updateBookingWithOwner('2020/03/01', 'WAW', 'free', 'joo,foo');

      expect(updatedBooking).toEqual('updated booking');
    });

    it('return updated booking with without reservation for appropriate user', async () => {
      query.mockImplementation(() => bookingDataMock('joo,foo'));

      const updatedBooking = await updateBookingWithOwner('2020/03/01', 'WAW', 'joo,foo', 'free');

      expect(updatedBooking).toEqual('updated booking');
    });

    it(`returns empty object when reservation doesn't exist`, async () => {
      query.mockImplementation(() => bookingDataMock('free'));

      const updatedBooking = await updateBookingWithOwner('2020/03/01', 'WAW', 'joo.foo', 'free');

      expect(updatedBooking).toEqual({});
    });

    it(`returns empty object when the reservation is unavailable`, async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo'));

      const updatedBooking = await updateBookingWithOwner('2020/03/01', 'WAW', 'free', 'joo.foo');

      expect(updatedBooking).toEqual({});
    });
  });

  describe('Checks getFutureBookings method', () => {
    beforeAll(() => {
      query.mockImplementation(() => ({
        Items: [],
      }));
      parseCurrentDate.mockImplementation(() => '2020/03/11');
    });

    it('returns future bookings', async () => {
      const futureBookings = await getFutureBookings();

      expect(futureBookings).toEqual([]);
    });
  });
});
