const {
  addParkingPlace,
  getParkingPlaces,
  createParkingPlacesWithOwner,
} = require('../../app/dao/parkingPlace.js');
const { save, query } = require('../../app/services/dbService');

jest.mock('../../app/services/dbService.js');

const ParkingPlaceMock = {
  City: 'GDN',
  PlaceID: '1a',
};

describe.only('parkingPlace.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Checks saveParkingPlace method', () => {
    it('returns true when the parking space has been added to the database', async () => {
      save.mockImplementation(() => true);

      const place = await addParkingPlace(ParkingPlaceMock);

      expect(place).toBe(true);
    });
  });

  describe('Checks getParkingPlace method', () => {
    it('returns parking places for specific city', async () => {
      query.mockImplementation(() => ({
        Items: [],
      }));

      const parkingPlaces = await getParkingPlaces('GDN');

      expect(parkingPlaces).toEqual([]);
    });
  });
  describe('Checks createParkingPlaces method', () => {
    it('returns parking places with owner', async () => {
      query.mockImplementation(() => ({
        Items: [ParkingPlaceMock],
      }));

      const parkingPlaces = await createParkingPlacesWithOwner('GDN');

      expect(parkingPlaces[0]).toHaveProperty('Owner', 'free');
    });
  });
});
