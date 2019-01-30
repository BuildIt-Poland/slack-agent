const queryString = require('query-string');
const dynamo = require('./dynamo.js');
const smb = require('slack-message-builder');

exports.saveParkingPlace = async (place, tableName) => {
    return await dynamo.save(place, tableName);
}

exports.getParkingPlaces = async (tableName) => {
    const params = {
        ExpressionAttributeValues: {
            ':types': 'parkingPlace'
        },
        FilterExpression: 'Types = :types',
        TableName: tableName
    }
    return await dynamo.scan(params);
}

exports.createPlace = async (payload, tableName) => {
    const place = parseSlackTextToPlace(payload);
    if (!place) return null;
    const isPlaceExist = await placeExistInDynamo(place, tableName);
    return isPlaceExist ? null : {
        Types: 'parkingPlace',
        ...place
    };
}

exports.convertParkingPlacesToSlackMessage = (places) => {
    if (!Array.isArray(places) || !places.length)
        return smb().text(`Parking places don't exists`).json();
    const attachments = places.map(place => {
        return {
            fields: [{
                title: place.City,
                value: place.Place
            }]
        }
    });
    return smb().text(`Parking Places:`).attachments(attachments).json();
}

exports.convertParkingPlaceToSlackMessage = (place) => {
    return smb()
        .attachment()
        .pretext(`We've added a parking place`)
        .field()
        .title(`City: ${place.City}`)
        .value(`Place: ${place.Place}`)
        .end()
        .end()
        .json();
}

const parseSlackTextToPlace = (payload) => {
    const params = queryString.parse(payload.body);
    const text = params.text.split(' ');
    return text.length == 2 ? {
        City: text[0],
        Place: text[1]
    } : null
}

const placeExistInDynamo = async (place, tableName) => {
    const params = {
        ExpressionAttributeValues: {
            ':place': `${place.Place}`,
            ':city': `${place.City}`
        },
        FilterExpression: 'Place = :place and City = :city',
        TableName: tableName
    }
    const result = await dynamo.scan(params);
    return !(result.Items.length === 0);
}