jest.mock('../../app/dao/bookings.js');
jest.mock('../../app/dao/parkingPlace.js');
jest.mock('../../app/services/authService.js');
jest.mock('../../app/utilities/requestParser.js');

const {
  isBookingAvailableForPeriod,
  createBookingAndBookParkingPlace,
  bookingExists,
  bookParkingPlace
} = require('../../app/dao/bookings.js');
const { cityExists, parkingPlaceExists } = require('../../app/dao/parkingPlace.js');
const { isVerified } = require('../../app/services/authService.js');
const { parseBodyToObject } = require('../../app/utilities/requestParser.js');
const { book } = require('../../app/handlers/addBooking.js');

describe('addBooking.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 status for unauthroized user', async () => {
    isVerified.mockImplementation(() => Promise.resolve(false));
    const response = await book({ body: 'text=Gdansk+30' });

    expect(response.statusCode).toBe(401);
  });

  it('calls parseBodyToObject with body as first argument', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'mocked message',
      isValid: true,
    }));

    const body = 'text=2020/02/21+Gdansk&user_name=john.doe';
    await book({ body });

    expect(parseBodyToObject).toBeCalledWith(body, expect.any(Object));
  });

  it('returns success and proper message if body format is invalid', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'Body invalid',
      isValid: false,
    }));

    const { body, statusCode } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(200);
    expect(body).toBe('{"text": "Body invalid"}');
  });

  it(`returns message 'Parking place undefined isn't available' while booking is unavailable for period`, async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => false);

    const { body } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });
    expect(body).toEqual(`{"text": "Parking place  isn't available"}`);
  });

  it(`returns message 'Parking place isn't available' while booking is unavailable`, async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(false));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        palceId: '1',
      },
      isValid: true,
    }));

    const { body } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });
    expect(body).toEqual(`{"text": "Parking place  isn't available"}`);
  });

  it('returns internal server error while error occured during booking', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => true);
    createBookingAndBookParkingPlace.mockImplementation(() => Promise.reject(new Error()));

    const { statusCode } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(500);
  });

  it(`returns message 'City doesn't exist' when city doesn't exist`, async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(false));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'mocked message',
      isValid: true,
    }));

    const { body } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });
    expect(body).toEqual('{"text": "City undefined doesn’t exist"}');
  });

  it('returns success status and creates booking correctly', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => true);
    bookingExists.mockImplementation(() => Promise.resolve(false));
    createBookingAndBookParkingPlace.mockImplementation(() => Promise.resolve([{ PlaceID: '1a' }]));


    const { statusCode } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(200);
  });

  it('returns success status and update existing booking correctly', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    cityExists.mockImplementation(() => Promise.resolve(true));
    parkingPlaceExists.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => Promise.resolve(true));
    bookParkingPlace.mockImplementation(() => Promise.resolve([{ PlaceID: '1a' }]));

    const { statusCode } = await book({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(200);
  });
});
