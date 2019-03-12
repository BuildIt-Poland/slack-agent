jest.mock('../../app/dao/bookings.js');
jest.mock('../../app/utilities/requestParser.js');
jest.mock('../../app/services/authService.js');
jest.mock('../../app/services/parkingPlacesService.js');

const { getFutureBookings } = require('../../app/dao/bookings.js');
const { parseBodyToObject } = require('../../app/utilities/requestParser.js');
const { getParkingPlacesForBookings } = require('../../app/services/parkingPlacesService.js');
const { isVerified } = require('../../app/services/authService.js');
const { my } = require('../../app/handlers/listUserParkingPlaces.js');

describe('listUserParkingPlaces.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 status for unauthroized user', async () => {
    isVerified.mockImplementation(() => Promise.resolve(false));
    const response = await my({ body: 'text=' });

    expect(response.statusCode).toBe(401);
  });

  it('calls parseBodyToObject with body as first argument', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'mocked message',
      isValid: true,
    }));

    const body = 'user_name=john.doe';
    await my({ body });

    expect(parseBodyToObject).toBeCalledWith(body, expect.any(Object));
  });

  it('returns success and proper message if body format is invalid', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: 'Body invalid',
      isValid: false,
    }));

    const { body, statusCode } = await my({ body: 'user_name=john.doe' });

    expect(statusCode).toBe(200);
    expect(body).toBe('{"text": "Body invalid"}');
  });

  it('returns success status and list parking places for specific user', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    parseBodyToObject.mockImplementation(() => ({
      message: {
        userName: 'john.doe',
      },
      isValid: true,
    }));
    getFutureBookings.mockImplementation(() => []);
    getParkingPlacesForBookings.mockImplementation(() => []);

    const { statusCode } = await my({ body: 'text=user_name=john.doe' });

    expect(statusCode).toBe(200);
  });
});
