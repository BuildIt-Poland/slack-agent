jest.mock('../../app/dao/bookings.js');
jest.mock('../../app/utilities/requestParser.js');
jest.mock('../../app/services/authService.js');
jest.mock('../../app/services/parkingPlacesService.js');

const { getBooking } = require('../../app/dao/bookings.js');
const { parseBodyToObject } = require('../../app/utilities/requestParser.js');
const { isVerified } = require('../../app/services/authService.js');
const { free } = require('../../app/handlers/freeParkingPlaces.js');

describe('freeParkingPlaces.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 status for unauthroized user', async () => {
    isVerified.mockImplementation(() => Promise.resolve(false));
    const response = await free({ body: 'text=' });

    expect(response.statusCode).toBe(401);
  });

  it('calls parseBodyToObject with body as first argument', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: [],
      },
      isValid: true,
    }));
    getBooking.mockImplementation(() => []);

    const body = 'text=2020/02/21+Gdansk&user_name=john.doe';
    await free({ body });

    expect(parseBodyToObject).toBeCalledWith(body, expect.any(Object));
  });

  it('returns success and proper message if body format is invalid', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'Body invalid',
      isValid: false,
    }));

    const { body, statusCode } = await free({ body: 'text=2020/02/21+Gdansk&user_name=john.doe' });

    expect(statusCode).toBe(200);
    expect(body).toBe('{"text": "Body invalid"}');
  });

  it('returns success status and statement that places are unavailable', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
        city: 'GND',
      },
      isValid: true,
    }));
    getBooking.mockImplementation(() => []);

    const { statusCode } = await free({ body: 'text=2020/02/21+GND&user_name=john.doe' });

    expect(statusCode).toBe(200);
  });

  it('returns success status and parking places', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        dates: ['2020/02/21'],
      },
      isValid: true,
    }));
    getBooking.mockImplementation(() => ({
      Places: [],
    }));

    const { statusCode } = await free({ body: 'text=2020/02/21+GND&user_name=john.doe' });

    expect(statusCode).toBe(200);
  });
});
