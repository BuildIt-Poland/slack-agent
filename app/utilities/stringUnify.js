const { entries, forEach, replace } = require('lodash');

const UNIFY_PATTERNS = {
  'a': 'á|à|ã|â|ą|À|Á|Ã|Â|Ą',
  'e': 'é|è|ê|ę|É|È|Ê|Ę',
  'i': 'í|ì|î|Í|Ì|Î',
  'o': 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
  'u': 'ú|ù|û|ü|Ú|Ù|Û|Ü',
  'c': 'ç|ć|Ç|Ć',
  'n': 'ñ|ń|Ñ|Ń',
  'z': 'ź|ż|Ź|Ż'
};

const stringUnify = (str) => {
  if (!str) {
    return undefined;
  }

  let unifyString = replace(str.toLowerCase(), /^\w/, c => c.toUpperCase());

  forEach(entries(UNIFY_PATTERNS), ([replacement, regexp]) => {
    unifyString = replace(unifyString, new RegExp(regexp, 'g'), replacement);
  });

  return unifyString;
}

module.exports = {
  stringUnify,
};
