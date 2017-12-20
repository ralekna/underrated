const {expect} = require('chai');
const {createSandbox} = require('sinon');
const request = require('request-promise-native');
const {getCoinMarketCapData} = require('./../../src/market/cmc-data');

describe('[cmc-data]', () => {
  describe('getCoinMarketCapData()', () => {

    let sandbox;
    let marketData;


    beforeEach(async () => {
      sandbox = createSandbox();
      sandbox.stub(request, 'get').withArgs('https://api.coinmarketcap.com/v1/ticker/?limit=0').resolves(`[
          {
              "id": "bitcoin", 
              "name": "Bitcoin", 
              "symbol": "BTC", 
              "rank": "1", 
              "price_usd": "18164.3", 
              "price_btc": "1.0", 
              "24h_volume_usd": "16127400000.0", 
              "market_cap_usd": "304287445385", 
              "available_supply": "16751950.0", 
              "total_supply": "16751950.0", 
              "max_supply": "21000000.0", 
              "percent_change_1h": "-1.43", 
              "percent_change_24h": "-3.35", 
              "percent_change_7d": "3.95", 
              "last_updated": "1513712953"
          }, 
          {
              "id": "ethereum", 
              "name": "Ethereum", 
              "symbol": "ETH", 
              "rank": "2", 
              "price_usd": "845.179", 
              "price_btc": "0.0469274", 
              "24h_volume_usd": "4282140000.0", 
              "market_cap_usd": "81510920278.0", 
              "available_supply": "96442198.0", 
              "total_supply": "96442198.0", 
              "max_supply": null, 
              "percent_change_1h": "-0.42", 
              "percent_change_24h": "10.08", 
              "percent_change_7d": "37.04", 
              "last_updated": "1513712953"
          }
      ]`);

      afterEach(() => {
        sandbox.restore();
      });

      marketData = await getCoinMarketCapData();
    });

    it('should get two currencies', () => {
      expect(marketData).to.have.lengthOf(2);
      expect(marketData).to.be.an('array');
      expect(marketData[0]).to.have.property('symbol', 'BTC');
      expect(marketData[1]).to.have.property('symbol', 'ETH');
    });

    it('should have field names converted', () => {
      expect(marketData[0]).to.be.an('object');
      expect(marketData[0]).to.have.property('priceUsd');
      expect(marketData[0]).to.have.property('priceBtc');
      expect(marketData[0]).to.have.property('volumeUsd24H');
      expect(marketData[0]).to.have.property('marketCapUsd');
      expect(marketData[0]).to.have.property('availableSupply');
      expect(marketData[0]).to.have.property('totalSupply');
      expect(marketData[0]).to.have.property('maxSupply');
      expect(marketData[0]).to.have.property('percentChange1h');
      expect(marketData[0]).to.have.property('percentChange24h');
      expect(marketData[0]).to.have.property('percentChange7d');
    });

    it('should have left null fields as is', () => {
      expect(marketData[0]).to.have.property('maxSupply').not.equal(null);
      expect(marketData[1]).to.have.property('maxSupply').equal(null);
    });
  });
});
