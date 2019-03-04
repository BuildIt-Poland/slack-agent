/* global describe it beforeEach afterEach */
const { addParkingPlace, getParkingPlaces } = require('../../app/dao/parkingPlace.js');
const {
  restoreDynamoClientMock,
  mockSave,
  mockQuery,
} = require('../../__mocks__/services/dbService.js');
const { parkingPalcesData } = require('../../__mocks__/data/parkingPlace.js');

describe.only('parkingPlace.test.js', () => {
  afterEach(() => {
    restoreDynamoClientMock();
  });

  describe('Checks saveParkingPlace method', () => {
    beforeEach(() => {
      mockSave('City', 'PlaceID', 'ParkingPlaces-dev');
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
      mockQuery(parkingPalcesData);
    });

    it('returns parking places for specific city', async () => {
      const parkingPlaces = await getParkingPlaces('GDN');

      expect(parkingPlaces[0]).toHaveProperty('City', 'GDN');
      expect(parkingPlaces[0]).toHaveProperty('PlaceID', '1a');
    });
  });
});
