jest.mock('../../app/dao/parkingPlace.js');
jest.mock('../../app/services/dbService.js');
jest.mock('../../app/services/dateService.js');

const { getParkingPlaces } = require('../../app/dao/parkingPlace.js');
const {
  isBookingAvailableForPeriod,
  getBooking,
  bookingExists,
  createBooking,
  bookParkingPlace,
  unbookParkingPlace,
  getFutureBookings,
} = require('../../app/dao/bookings.js');
const { query, save, update } = require('../../app/services/dbService.js');

const bookingDataMock = (owner, placeId) => ({
  Items: [
    {
      Places: [
        {
          PlaceID: placeId,
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

  describe('Checks isBookingAvailableForPeriod method', () => {
    it('returns true when any place is available for period', async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');

      expect(isAvailable).toEqual(true);
    });

    it('returns false when any place is unavailable for period', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW');

      expect(isAvailable).toEqual(false);
    });

    it('returns true when specyfic place is available for period', async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW', '1a');

      expect(isAvailable).toEqual(true);
    });
    it('returns false when specyfic place is unavailable for period', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const isAvailable = await isBookingAvailableForPeriod('2020/03/01', 'WAW', '1a');

      expect(isAvailable).toEqual(false);
    });
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
    it('returns true when booking created with reservation of any available place', async () => {
      save.mockImplementation(() => true);
      getParkingPlaces.mockImplementation(() => [
        {
          PlaceID: '1a',
        },
        {
          PlaceID: '2b',
        },
      ]);

      const booking = await createBooking('2020/03/01', 'WAW', 'joo.foo');

      expect(booking).toEqual(true);
    });

    it('returns true when booking created with reservation of specific place', async () => {
      save.mockImplementation(() => true);
      getParkingPlaces.mockImplementation(() => [
        {
          PlaceID: '1a',
        },
        {
          PlaceID: '1b',
        },
      ]);

      const booking = await createBooking('2020/03/01', 'WAW', 'joo.foo', '1b');

      expect(booking).toEqual(true);
    });
  });

  describe('Checks bookParkingPlace method', () => {
    beforeAll(() => {
      update.mockImplementation(() => 'updated booking');
    });

    it('returns updated booking with of any available place', async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const updatedBooking = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual('updated booking');
    });

    it('returns updated booking with reservation of specific place', async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const updatedBooking = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo', '1a');

      expect(updatedBooking).toEqual('updated booking');
    });

    it('returns empty object when reservation of any place is unavailable', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const updatedBooking = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual({});
    });

    it('returns empty object when reservation of specific place is unavailable', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const updatedBooking = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo', '1a');

      expect(updatedBooking).toEqual({});
    });
  });

  describe('Checks unbookParkingPlace method', () => {
    beforeAll(() => {
      update.mockImplementation(() => 'updated booking');
    });

    it('returns updated booking without booking place', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const updatedBooking = await unbookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual('updated booking');
    });

    it(`returns empty object when reservation doesn't exist`, async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const updatedBooking = await unbookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(updatedBooking).toEqual({});
    });
  });

  describe('Checks getFutureBookings method', () => {
    beforeAll(() => {
      query.mockImplementation(() => ({
        Items: ['futureBooking'],
      }));
    });

    it('returns future bookings', async () => {
      const futureBookings = await getFutureBookings();

      expect(futureBookings).toEqual(['futureBooking', 'futureBooking']);
    });
  });
});
