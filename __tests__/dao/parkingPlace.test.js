/* global describe it beforeEach afterEach */
const { addParkingPlace, getParkingPlaces } = require('../../app/dao/parkingPlace.js');
const {
  restoreDynamoClient,
  saveParkingPlace,
  PARKING_PLACES,
  query,
} = require('../../__mocks__/services/dbService.js');

describe.only('parkingPlace.test.js', () => {
  afterEach(() => {
    restoreDynamoClient();
  });
  describe('Checks saveParkingPlace method', () => {
    beforeEach(() => {
      saveParkingPlace('database error');
    });
    it('returns true when the parking space has been added to the database', async () => {
      const place = await addParkingPlace({
        City: 'GDN',
        PlaceID: '1a',
      });
      expect(place).toBe(true);
    });
  });
  describe('Checks getParkingPlace method', () => {
    beforeEach(() => {
      query(PARKING_PLACES);
    });
    it('returns parking places for specific city', async () => {
      const parkingPlaces = await getParkingPlaces('GDN');
      expect(parkingPlaces[0]).toHaveProperty('City', 'GDN');
      expect(parkingPlaces[0]).toHaveProperty('PlaceID', '1a');
    });
  });
});
