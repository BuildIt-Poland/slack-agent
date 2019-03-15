const {
  isBookingAvailableForAnyPlaces,
  isBookingAvailableForSpecyficPlaces,
} = require('../../app/services/bookingsService.js');

const bookingsMock = owner => [
  {
    Places: [
      {
        PlaceID: '1a',
        Owner: owner,
      },
    ],
  },
];

describe.only('bookingsService.test.js', () => {
  describe('Checks isBookingAvailableForAnyPlaces method', () => {
    it('returns true when booking is available for any place', () => {
      const isBookingAvailable = isBookingAvailableForAnyPlaces(bookingsMock('free'));

      expect(isBookingAvailable).toEqual(true);
    });

    it('returns false when booking is unavailable for any place', () => {
      const isBookingAvailable = isBookingAvailableForAnyPlaces(bookingsMock('joo.foo'));

      expect(isBookingAvailable).toEqual(false);
    });
  });

  describe('Checks isBookingAvailableForSpecyficPlaces method', () => {
    it('returns true when booking is available for specific place', () => {
      const isBookingAvailable = isBookingAvailableForSpecyficPlaces(bookingsMock('free'), '1a');

      expect(isBookingAvailable).toEqual(true);
    });

    it('returns false when booking is unavailable for specific place', () => {
      const isBookingAvailable = isBookingAvailableForSpecyficPlaces(bookingsMock('joo.foo'), '1a');

      expect(isBookingAvailable).toEqual(false);
    });
  });
});
