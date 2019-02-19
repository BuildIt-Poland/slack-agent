exports.isRequired = (object) => object != undefined && object != '';

exports.dateMoreThanCurrent = (date) => (Date.parse(date) >=  new Date().setHours(0,0,0,0));

exports.cityPattern = (city) => /^(?:[A-Za-z]{2,}(?:(\.\s|'s\s|\s?-\s?|\s)?(?=[A-Za-z]+))){1,2}(?:[A-Za-z]+)?$/.test(city);