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

  describe('Checks getParkingPlacesForBookings method', () => {
    it('returns all booked parking places for specific user', () => {
      const mapParkingPlacesForUserMock = jest.spyOn(
        parkingPlacesService,
        'getParkingPlacesForUser',
      );
      mapParkingPlacesForUserMock.mockImplementation(() => []);

      const userParkingPlaces = parkingPlacesService.getParkingPlacesForBookings(
        bookingsMock,
        'foo.bar',
      );

      expect(userParkingPlaces).toEqual([]);
    });
  });

  describe('Checks getParkingPlacesForUser method', () => {
    const { Places, City, BookingDate } = bookingsMock[0];

    it(`returns available parking places for user`, () => {
      const [parkingPlace] = parkingPlacesService.getParkingPlacesForUser(Places, 'foo.bar', {
        City,
        BookingDate,
      });

      expect(parkingPlace).toHaveProperty('PlaceID', '1a');
      expect(parkingPlace).toHaveProperty('City', 'GDN');
      expect(parkingPlace).toHaveProperty('BookingDate', '2020/03/01');
    });

    it(`returns empty array when user did't book parking place`, () => {
      const parkingPlaces = parkingPlacesService.getParkingPlacesForUser(Places, 'testUser', {
        City,
        BookingDate,
      });

      expect(parkingPlaces).toEqual([]);
    });
  });

  describe('Checks mapParkingPlacesWithUser method', () => {
    it('returns maped parking places', () => {
      const parkingPlacesMock = [
        {
          PlaceID: '1a',
        },
      ];

      const [parkingPlace] = parkingPlacesService.mapParkingPlacesWithUser(
        parkingPlacesMock,
        'joo.foo',
      );

      expect(parkingPlace).toHaveProperty('PlaceID', '1a');
      expect(parkingPlace).toHaveProperty('Owner', 'joo.foo');
    });
  });
});
