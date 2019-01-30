const queryString = require('query-string');
const dynamo = require('./dynamo.js');

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