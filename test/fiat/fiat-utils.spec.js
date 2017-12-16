const {expect} = require('chai');
const {isFiat} = require('../../src/fiat/fiat-util');

describe('[fiat-util]', () => {
  describe('isFiat()', () => {
    it('should tell that USD is a fiat currency', () => {
      expect(isFiat('USD')).to.be.true;
    });

    it('should tell that BTC is not a fiat currency', () => {
      expect(isFiat('BTC')).to.be.false;
    });
  });
});