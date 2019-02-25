const dynamo = require('../communication/dynamo.js');
const log = require('../communication/logger.js');

async function putReservation(place, reservationParams) {
  try {
    await dynamo.save(
      {
        Id: reservationParams.dates,
        City: 'multiple',
        Reservations: [
          {
            ...place,
            Reservation: reservationParams.userName,
          },
        ],
      },
    );
  } catch (error) {
    log.error('reservation.putReservation', error);
    return false;
  }
  return true;
}

async function updateReservation(reservationId, place, userName) {
  try {
    await dynamo.update({
      Key: { Id: reservationId, City: 'multiple' },
      UpdateExpression: 'set #reservations = list_append(#reservations, :place)',
      ExpressionAttributeNames: { '#reservations': 'Reservations' },
      ExpressionAttributeValues: {
        ':place': [
          {
            ...place,
            Reservation: userName,
          },
        ],
      },
    });
  } catch (error) {
    log.error('reservation.updateReservation', error);
    return false;
  }
  return true;
}

async function findPlacesInCityAsync(city) {
  const params = {
    KeyConditionExpression: 'City = :city',
    ExpressionAttributeValues: {
      ':city': city,
    },
    IndexName: 'city-index',
  };
  try {
    const result = await dynamo.query(params);
    return result.Items;
  } catch (error) {
    log.error('reservation.findPlacesInCityAsync', error);
    return null;
  }
}

function findIndexPlaceReservation(reservation, reservationParams) {
  return reservation.Reservations.findIndex(
    place =>
      place.Reservation === reservationParams.userName && place.City === reservationParams.city,
  );
}

exports.saveReservationAsync = async (reservationId, place, reservationParams) =>
  !reservationId
    ? putReservation(place, reservationParams)
    : updateReservation(reservationId, place, reservationParams.userName);

exports.findReservationByDateAsync = async (date) => {
  const params = {
    KeyConditionExpression: '#id = :dates and City = :city',
    ExpressionAttributeNames: {
      '#id': 'Id',
    },
    ExpressionAttributeValues: {
      ':dates': date,
      ':city': 'multiple',
    },
  };
  try {
    const result = await dynamo.query(params);
    return result.Items[0] || {};
  } catch (error) {
    log.error('reservation.findReservationByDateAsync', error);
    return null;
  }
};
exports.findFreePlaceAsync = async (reservation, city) => {
  const places = await findPlacesInCityAsync(city);
  if (!places) return null;
  if (!places.length) return {};
  if (!Object.keys(reservation).length) return places[0];
  const freePlace = places.find(
    place => !reservation.Reservations.some(item => place.Id === item.Id),
  );
  return freePlace || {};
};

exports.listReservationsForDayAsync = async (reservation, city) => {
  const places = await findPlacesInCityAsync(city);
  if (!places) return null;
  if (!places.length) return [];
  if (!Object.keys(reservation).length)
    return places.map(place => ({ City: place.City, Place: place.Place, Reservation: 'free' }));
  const allPlaces = places.map(place => {
    const res = reservation.Reservations.find(item => place.Id === item.Id);
    return res
      ? {
          City: res.City,
          Place: res.Place,
          Reservation: res.Reservation || null,
        }
      : {
          City: place.City,
          Place: place.Place,
          Reservation: 'free',
        };
  });
  return allPlaces;
};

exports.deleteReservationPlace = async (reservation, reservationParams) => {
  const placeIndex = findIndexPlaceReservation(reservation, reservationParams);
  if (placeIndex === -1) return false;
  try {
    await dynamo.update({
      Key: { Id: reservation.Id, City: 'multiple' },
      UpdateExpression: `REMOVE Reservations[${placeIndex}]`,
    });
  } catch (error) {
    log.error('reservation.deleteReservation', error);
    return false;
  }
  return true;
};
