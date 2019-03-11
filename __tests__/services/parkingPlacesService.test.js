const parkingPlacesService = require('../../app/services/parkingPlacesService.js');

const bookingsMock = [
  {
    City: 'GDN',
    BookingDate: '2020/03/01',
    Places: [
      {
        PlaceID: '1a',
        Owner: 'foo.bar',
      },
    ],
  },
];

describe.only('parkingPlacesService.test.js', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('Checks getUserParkingPlaces method', () => {
    it('returns all booked parking places for specific user', () => {
      const mapParkingPlacesForUserMock = jest.spyOn(
        parkingPlacesService,
        'mapParkingPlacesForUser',
      );
      mapParkingPlacesForUserMock.mockImplementation(() => ['ParkingPlaces', 'ParkingPlaces']);

      const userParkingPlaces = parkingPlacesService.getUserParkingPlaces('foo.bar', bookingsMock);

      expect(userParkingPlaces).toEqual(['ParkingPlaces', 'ParkingPlaces']);
    });
  });

  describe('Checks mapParkingPlacesForUser method', () => {
    const { Places, City, BookingDate } = bookingsMock[0];

    it(`returns maped available parking places for user`, () => {
      const mapedParkingPlaces = parkingPlacesService.mapParkingPlacesForUser(
        Places,
        City,
        BookingDate,
        'foo.bar',
      );

      expect(mapedParkingPlaces[0]).toHaveProperty('PlaceID', '1a');
      expect(mapedParkingPlaces[0]).toHaveProperty('City', 'GDN');
      expect(mapedParkingPlaces[0]).toHaveProperty('BookingDate', '2020/03/01');
    });

    it(`returns empty array when user did't book parking place`, () => {
      const mapedParkingPlaces = parkingPlacesService.mapParkingPlacesForUser(
        Places,
        City,
        BookingDate,
        'testUser',
      );

      expect(mapedParkingPlaces).toEqual([]);
    });
  });
});
