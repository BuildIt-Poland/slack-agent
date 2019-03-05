const { addParkingPlace, getParkingPlaces } = require('../../app/dao/parkingPlace.js');

jest.mock('../../app/services/dbService.js', () => ({
  save: () => true,
  query: () => ({ Items: [] }),
}));

describe.only('parkingPlace.test.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Checks saveParkingPlace method', () => {
    it('returns true when the parking space has been added to the database', async () => {
      const place = await addParkingPlace({
        City: 'GDN',
        PlaceID: '1a',
      });

      expect(place).toBe(true);
    });
  });

  describe('Checks getParkingPlace method', () => {
    it('returns parking places for specific city', async () => {
      const parkingPlaces = await getParkingPlaces('GDN');

      expect(parkingPlaces).toEqual([]);
    });
  });
});
