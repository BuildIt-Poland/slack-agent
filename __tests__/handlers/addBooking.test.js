jest.mock('../../app/dao/bookings.js');
jest.mock('../../app/services/authService.js');
jest.mock('../../app/utilities/requestParser.js');

const { isBookingAvailableForPeriod, createBooking } = require('../../app/dao/bookings.js');
const { isVerified } = require('../../app/services/authService.js');
const { parseBodyToObject } = require('../../app/utilities/requestParser.js');
const { add } = require('../../app/handlers/addBooking.js');

describe('addBooking.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 status for unauthroized user', async () => {
    isVerified.mockImplementation(() => Promise.resolve(false));
    const response = await add({ body: 'text=Gdansk+30' });

    expect(response.statusCode).toBe(401);
  });

  it('calls parseBodyToObject with body as first argument', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'mocked message',
      isValid: true,
    }));

    const body = 'text=2020/02/21+Gdansk&user_name=john.doe';
    await add({ body });

    expect(parseBodyToObject).toBeCalledWith(body, expect.any(Object));
  });

  it('returns success and proper message if body format is invalid', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'Body invalid',
      isValid: false,
    }));

    const { body, statusCode } = await add({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(200);
    expect(body).toBe('{"text": "Body invalid"}');
  });

  it('returns internal server error while booking is unavailable for period', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => false);

    const { statusCode } = await add({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });
    expect(statusCode).toBe(500);
  });

  it('returns internal server error while error occured during booking', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => true);
    createBooking.mockImplementation(() => Promise.reject(new Error()));

    const { statusCode } = await add({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(500);
  });

  it('returns success status and creates booking correctly', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    isBookingAvailableForPeriod.mockImplementation(() => true);
    createBooking.mockImplementation(() => Promise.resolve(true));

    const { statusCode } = await add({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(200);
  });
});
