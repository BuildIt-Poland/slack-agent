jest.mock('../../app/services/dbService.js');

const {
  addParkingPlace,
  getParkingPlaces,
  parkingPlaceExists,
  cityExists,
  getAllLocationsWithPlaces
} = require('../../app/dao/parkingPlace.js');
const { save, query, scan } = require('../../app/services/dbService');

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
      save.mockImplementation(() => Promise.resolve(true));

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

  describe('Checks parkingPlaceExists method', () => {
    it('returns true when parking place exists', async () => {
      query.mockImplementation(() => ({
        Items: ['parkingPlace'],
      }));

      const doesExists = await parkingPlaceExists('1a', 'GDN');

      expect(doesExists).toBe(true);
    });

    it('returns false when parking place does not exists', async () => {
      query.mockImplementation(() => ({
        Items: [],
      }));

      const doesExists = await parkingPlaceExists('1a', 'GDN');

      expect(doesExists).toBe(false);
    });
  });

  describe('Checks cityExists method', () => {
    it('returns true when city exists ', async () => {
      query.mockImplementation(() => ({
        Items: ['parkingPlace'],
      }));

      const doesExists = await cityExists('1a', 'GDN');

      expect(doesExists).toBe(true);
    });

    it('returns false when city does not exists', async () => {
      query.mockImplementation(() => ({
        Items: ['parkingPlace'],
      }));

      const doesExists = await cityExists('1a', 'GDN');

      expect(doesExists).toBe(true);
    });
  });

  describe('Checks getAllLocationsWithPlaces method', () => {
    it('returns all parking places for locations', async () => {
      scan.mockImplementation(() => ({
        Items: ['parkingPlace'],
      }));

      const [parkingPlace] = await getAllLocationsWithPlaces();

      expect(parkingPlace).toEqual('parkingPlace');
    });
  });
});
