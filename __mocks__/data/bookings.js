exports.bookingsData = {
  availableBooking: {
    City: 'WAW',
    BookingDate: '2020/03/01',
    Places: [
      {
        PlaceID: '1a',
        Owner: 'hein.maciej',
      },
      {
        PlaceID: '1b',
        Owner: 'free',
      },
      {
        PlaceID: '1c',
        Owner: 'free',
      },
    ],
  },
  unavailableBooking: {
    City: 'WAW',
    BookingDate: '2020/03/01',
    Places: [
      {
        PlaceID: '1a',
        Owner: 'foo.bar',
      },
      {
        PlaceID: '1b',
        Owner: 'john.doe',
      },
      {
        PlaceID: '1c',
        Owner: 'mac.gyver',
      },
    ],
  },
};
