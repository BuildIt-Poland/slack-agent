const {
  decoratedParkingPlaces,
  getUserParkingPlacesForBookings,
  getUserBookedParkingPlaces,
  changeParkingPlaceOwner,
  findParkingPlaceIndex,
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

  describe('Checks decoratedParkingPlaces method', () => {
    it('returns decorated parking places', () => {
      const parkingPlacesMock = [
        {
          PlaceID: '1a',
        },
      ];

      const [parkingPlace] = decoratedParkingPlaces(parkingPlacesMock, { Owner: 'joo.foo' });

      expect(parkingPlace).toHaveProperty('PlaceID', '1a');
      expect(parkingPlace).toHaveProperty('Owner', 'joo.foo');
    });
  });

  describe('Checks changeParkingPlaceOwner method', () => {
    it('returns empty array when parking spaces does not exists', () => {
      const parkingPlaces = changeParkingPlaceOwner([], 'joo.foo', '1a');

      expect(parkingPlaces).toEqual([]);
    });

    it('returns parking places with changed owner one of the places', () => {
      const [parkingPlace] = changeParkingPlaceOwner([{ Owner: 'free' }], 'joo.foo');

      expect(parkingPlace).toHaveProperty('Owner', 'joo.foo');
    });

    it('returns parking places with changed owner of a specific place', () => {
      const [parkingPlace] = changeParkingPlaceOwner(
        [{ PlaceID: '1a', Owner: 'free' }, { PlaceID: '1b', Owner: 'free' }],
        'joo.foo',
        '1a',
      );
      expect(parkingPlace).toHaveProperty('Owner', 'joo.foo');
    });
  });

  describe('Checks findParkingPlaceIndex method', () => {
    it('returns index of specific parking place for owner', () => {
      const parkingPlaceIndex = findParkingPlaceIndex(bookingsMock[0].Places, 'foo.bar', '1a');

      expect(parkingPlaceIndex).toEqual(0);
    });
    it('returns index of any parking place for owner', () => {
      const parkingPlaceIndex = findParkingPlaceIndex(bookingsMock[0].Places, 'foo.bar');

      expect(parkingPlaceIndex).toEqual(0);
    });
  });
});
