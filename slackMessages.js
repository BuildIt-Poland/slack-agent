'use strict'

exports.parkingPlaceAddedSlackMessage = (place) => {
    return `{"text": "You added a parking place.\n *City:* ${place.City}\n *Place:* ${place.Place}"}`;
}

exports.listParkingPlaceSlackMessage = (places) => {
    if (!Array.isArray(places) || !places.length)
    return `{"text": "Parking places don't exists}`;
    const attachments = places.map(place =>  ({ text: `*City:* ${place.City}\n *Place:* ${place.Place}`}));
    return `{"text": "List of Parking Places:", "attachments" : ${JSON.stringify(attachments)}}`;
}