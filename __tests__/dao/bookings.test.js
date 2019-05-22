jest.mock('../../app/dao/parkingPlace.js');
jest.mock('../../app/services/dbService.js');
jest.mock('../../app/services/dateService.js');

const { getParkingPlaces } = require('../../app/dao/parkingPlace.js');
const {
  isBookingAvailableForPeriod,
  getBooking,
  bookingExists,
  createBookingAndBookParkingPlace,
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

  describe('Checks createBookingAndBookParkingPlace method', () => {
    it('returns placeId when booking created with reservation of any available place', async () => {
      save.mockImplementation(() => Promise.resolve(true));
      getParkingPlaces.mockImplementation(() => [
        {
          PlaceID: '1a',
        },
        {
          PlaceID: '2b',
        },
      ]);

      const { PlaceID } = await createBookingAndBookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(PlaceID).toEqual('1a');
    });

    it('returns placeId when booking created with reservation of specific place', async () => {
      save.mockImplementation(() => Promise.resolve(true));
      getParkingPlaces.mockImplementation(() => [
        {
          PlaceID: '1a',
        },
        {
          PlaceID: '1b',
        },
      ]);

      const { PlaceID } = await createBookingAndBookParkingPlace('2020/03/01', 'WAW', 'joo.foo', '1b');

      expect(PlaceID).toEqual('1b');
    });
  });

  describe('Checks bookParkingPlace method', () => {
    beforeAll(() => {
      update.mockImplementation(() => Promise.resolve(true));
    });

    it('returns placeID of any available place', async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const { PlaceID } = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(PlaceID).toEqual('1a');
    });

    it('returns placeID with reservation of specific place', async () => {
      query.mockImplementation(() => bookingDataMock('free', '1a'));

      const { PlaceID } = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo', '1a');

      expect(PlaceID).toEqual('1a');
    });

    it('returns empty object when reservation of any place is unavailable', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const parkingPlace = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(parkingPlace).toEqual({});
    });

    it('returns empty object when reservation of specific place is unavailable', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const parkingPlace = await bookParkingPlace('2020/03/01', 'WAW', 'joo.foo', '1a');

      expect(parkingPlace).toEqual({});
    });
  });

  describe('Checks unbookParkingPlace method', () => {
    beforeAll(() => {
      update.mockImplementation(() => Promise.resolve(true));
    });

    it('returns placeId when reservation deleted', async () => {
      query.mockImplementation(() => bookingDataMock('joo.foo', '1a'));

      const { PlaceID } = await unbookParkingPlace('2020/03/01', 'WAW', 'joo.foo');

      expect(PlaceID).toEqual('1a');
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
