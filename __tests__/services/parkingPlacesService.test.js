const {
  decorateParkingPlacesWithUser,
  getUserParkingPlacesForBookings,
  getUserBookedParkingPlaces,
} = require('../../app/services/parkingPlacesService.js');

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

  describe('Checks getUserParkingPlacesForBookings method', () => {
    it('returns all booked parking places for specific user', () => {
      const [userParkingPlace] = getUserParkingPlacesForBookings(bookingsMock, 'foo.bar');

      expect(userParkingPlace).toHaveProperty('PlaceID', '1a');
      expect(userParkingPlace).toHaveProperty('City', 'GDN');
      expect(userParkingPlace).toHaveProperty('BookingDate', '2020/03/01');
    });

    it(`returns empty array when bookings don't exists for specific user`, () => {
      const userParkingPlaces = getUserParkingPlacesForBookings(bookingsMock, 'foo');

      expect(userParkingPlaces).toEqual([]);
    });
  });

  describe('Checks getUserBookedParkingPlaces method', () => {
    it('returns booked user parking places with additional parameters', () => {
      const [userParkingPlace] = getUserBookedParkingPlaces(bookingsMock[0].Places, 'foo.bar', {
        City: 'GDN',
      });

      expect(userParkingPlace).toHaveProperty('City', 'GDN');
      expect(userParkingPlace).toHaveProperty('PlaceID', '1a');
    });

    it('returns booked user parking places without additional parameters', () => {
      const [userParkingPlace] = getUserBookedParkingPlaces(bookingsMock[0].Places, 'foo.bar');

      expect(userParkingPlace).toHaveProperty('PlaceID', '1a');
    });
  });

  describe('Checks decorateParkingPlacesWithUser method', () => {
    it('return decorated parking places', () => {
      const parkingPlacesMock = [
        {
          PlaceID: '1a',
        },
      ];

      const [parkingPlace] = decorateParkingPlacesWithUser(parkingPlacesMock, 'joo.foo');

      expect(parkingPlace).toHaveProperty('PlaceID', '1a');
      expect(parkingPlace).toHaveProperty('Owner', 'joo.foo');
    });
  });
});
