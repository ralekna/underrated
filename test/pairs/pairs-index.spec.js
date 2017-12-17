const {expect} = require('chai');
const {stub} = require('sinon');
const {mapCoinsPairs} = require('../../src/pairs/pairs-index');
const request = require('request-promise-native');

describe('[pairs-index]', () => {
  describe('pairsIndex()', () => {

    let coinsMap;

    before(async () => {
      stub(request, 'get').withArgs('https://min-api.cryptocompare.com/data/all/exchanges').resolves(`{
        "Bitfinex": {
          "XRP": ["BTC", "USD"], 
          "BTC": ["USD", "EUR"], 
          "ETH": ["BTC", "USD"]
        },
        "Binance": {
          "XRP": ["BTC", "ETH"], 
          "BTC": ["USDT"], 
          "ETH": ["BTC", "USDT"]
        }
      }`);
      coinsMap = await mapCoinsPairs();
    });

    after(() => {

    });

    it('should create indexes of mentioned crypto coins', () => {
      expect(coinsMap).to.have.keys('XRP', 'BTC', 'ETH', 'USDT');
      expect(coinsMap).to.not.have.any.keys('USD', 'EUR');
    });

    it('should count pairs and exchanges correctly', () => {
      expect(coinsMap['XRP'].exchanges).to.have.property('size', 2);
      expect(coinsMap['XRP'].uniqueCryptoPairs).to.have.property('size', 2);
      expect(coinsMap['XRP'].uniqueFiatPairs).to.have.property('size', 1);
      expect(coinsMap['XRP'].allPairs).to.be.equal(4);
      expect(coinsMap['XRP'].exchangesToCoins).to.have.keys('Bitfinex', 'Binance');
      expect(coinsMap['XRP'].exchangesToCoins['Bitfinex']).to.contain('BTC', 'USD');
      expect(coinsMap['XRP'].exchangesToCoins['Binance']).to.contain('BTC', 'ETH');

      expect(coinsMap['BTC'].exchanges).to.have.property('size', 2);
      expect(coinsMap['BTC'].uniqueCryptoPairs).to.have.property('size', 3);
      expect(coinsMap['BTC'].uniqueFiatPairs).to.have.property('size', 2);
      expect(coinsMap['BTC'].allPairs).to.be.equal(7);
      expect(coinsMap['BTC'].exchangesToCoins).to.have.keys('Bitfinex', 'Binance');
      expect(coinsMap['BTC'].exchangesToCoins['Bitfinex']).to.contain('XRP', 'USD', 'EUR', 'ETH');
      expect(coinsMap['BTC'].exchangesToCoins['Binance']).to.contain('ETH', 'XRP', 'USDT');

      expect(coinsMap['ETH'].exchanges).to.have.property('size', 2);
      expect(coinsMap['ETH'].uniqueCryptoPairs).to.have.property('size', 3);
      expect(coinsMap['ETH'].uniqueFiatPairs).to.have.property('size', 1);
      expect(coinsMap['ETH'].allPairs).to.be.equal(5);
      expect(coinsMap['ETH'].exchangesToCoins).to.have.keys('Bitfinex', 'Binance');
      expect(coinsMap['ETH'].exchangesToCoins['Bitfinex']).to.contain('BTC', 'USD');
      expect(coinsMap['ETH'].exchangesToCoins['Binance']).to.contain('XRP', 'USDT', 'BTC');

      expect(coinsMap['USDT'].exchanges).to.have.property('size', 1);
      expect(coinsMap['USDT'].uniqueCryptoPairs).to.have.property('size', 2);
      expect(coinsMap['USDT'].uniqueFiatPairs).to.have.property('size', 0);
      expect(coinsMap['USDT'].allPairs).to.be.equal(2);
      expect(coinsMap['USDT'].exchangesToCoins).to.have.keys('Binance');
      expect(coinsMap['USDT'].exchangesToCoins['Binance']).to.contain('ETH', 'BTC');
    });
  });
});