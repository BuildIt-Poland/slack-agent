jest.mock('../../app/dao/parkingPlace.js');
jest.mock('../../app/services/authService.js');

const { getAllLocationsWithPlaces } = require('../../app/dao/parkingPlace.js');
const { isVerified } = require('../../app/services/authService.js');
const { locations } = require('../../app/handlers/locationsWithParkingPlaces.js');

describe('addBooking.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 status for unauthroized user', async () => {
    isVerified.mockImplementation(() => Promise.resolve(false));
    const response = await locations();

    expect(response.statusCode).toBe(401);
  });

  it('returns success status and parking places for locations', async () => {
    isVerified.mockImplementation(() => Promise.resolve(true));
    getAllLocationsWithPlaces.mockImplementation(() => Promise.resolve(true));

    const { statusCode } = await locations();

    expect(statusCode).toBe(200);
  });
});
