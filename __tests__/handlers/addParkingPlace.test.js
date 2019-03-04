jest.mock('../../app/dao/parkingPlace.js');
jest.mock('../../app/services/authService.js');

const parkingPlace = require('../../app/dao/parkingPlace.js');
const authorization = require('../../app/services/authService.js');
const { add } = require('../../app/handlers/addParkingPlace.js');

describe('addParkingPlace.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and success message for authorized user and parking place added correctly', async () => {
    parkingPlace.addParkingPlace.mockImplementation(() => Promise.resolve(true));
    authorization.isUnauthorized.mockImplementation(() => Promise.resolve(false));
    const response = await add({ body: 'text=Gdansk+30' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(
      '{"text": "You added a parking place.\n *City:* Gdansk\n *Place:* 30"}',
    );
  });

  it('returns 200 and `Invalid Command` message for authorized user and parser error', async () => {
    parkingPlace.addParkingPlace.mockImplementation(() => Promise.resolve(true));
    authorization.isUnauthorized.mockImplementation(() => Promise.resolve(false));
    const response = await add({ body: 'text=30' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"text": "Invalid command"}');
  });

  it('return 401 for unauthorized user', async () => {
    parkingPlace.addParkingPlace.mockImplementation(() => Promise.resolve(true));
    authorization.isUnauthorized.mockImplementation(() => Promise.resolve(true));
    const response = await add({ body: 'text=Gdansk+30' });

    expect(response.statusCode).toBe(401);
  });
});
