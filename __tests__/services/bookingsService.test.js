const {
  isBookingAvailableForAnyPlace,
  isBookingAvailableForSpecificPlace,
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
  describe('Checks isBookingAvailableForAnyPlace method', () => {
    it('returns true when booking is available for any place', () => {
      const isBookingAvailable = isBookingAvailableForAnyPlace(bookingsMock('free'));

      expect(isBookingAvailable).toEqual(true);
    });

    it('returns false when booking is unavailable for any place', () => {
      const isBookingAvailable = isBookingAvailableForAnyPlace(bookingsMock('joo.foo'));

      expect(isBookingAvailable).toEqual(false);
    });
  });

  describe('Checks isBookingAvailableForSpecificPlace method', () => {
    it('returns true when booking is available for specific place', () => {
      const isBookingAvailable = isBookingAvailableForSpecificPlace(bookingsMock('free'), '1a');

      expect(isBookingAvailable).toEqual(true);
    });

    it('returns false when booking is unavailable for specific place', () => {
      const isBookingAvailable = isBookingAvailableForSpecificPlace(bookingsMock('joo.foo'), '1a');

      expect(isBookingAvailable).toEqual(false);
    });
  });
});
