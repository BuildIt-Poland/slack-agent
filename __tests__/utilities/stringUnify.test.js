const { stringUnify } = require('../../app/utilities/stringUnify.js');

describe('stringUnify.test.js', () => {
  describe('Checks stringUnify method', () => {
    it('returns unified string', () => {
      const unifiedString = stringUnify("Gdańsk");

      expect(unifiedString).toEqual("Gdansk");
    });

    it('returns undefined', () => {
      const unifiedString = stringUnify(undefined);

      expect(unifiedString).toEqual(undefined);
    });
  });
});
