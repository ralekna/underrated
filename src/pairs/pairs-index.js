const request = require('request-promise-native');
const {isFiat} = require('../fiat/fiat-util');


function getCoinFromStore(coinName, coinsMap) {
  return coinsMap[coinName] || (coinsMap[coinName] = {
    exchanges:          new Set(),
    uniqueCryptoPairs:  new Set(),
    uniqueFiatPairs:    new Set(),
    allPairs:           0
  });
}

function addPairToCoin(coinName, pairCoinName, exchangeName, coinsMap) {
  let coin = getCoinFromStore(coinName, coinsMap);

  coin.allPairs++;
  coin.exchanges.add(exchangeName);
  if (isFiat(pairCoinName)) {
    coin.uniqueFiatPairs.add(pairCoinName);
  } else {
    coin.uniqueCryptoPairs.add(pairCoinName);

    let pairCoin = getCoinFromStore(pairCoinName, coinsMap);
    pairCoin.allPairs++;
    pairCoin.exchanges.add(exchangeName);
    pairCoin.uniqueCryptoPairs.add(coinName);

  }
}

async function mapCoinsPairs() {

  try {

    /*
     * {
     *  [exchange: string]: {
     *    [coin: string]: string[];
     *  };
     * }
     */
    const exchangesCoins = JSON.parse(await request.get('https://min-api.cryptocompare.com/data/all/exchanges'));

    // console.log(Object.keys(exchangesCoins));
    // return {};

    return Object.keys(exchangesCoins).reduce((coinsMap, exchangeName) => {

      let exchangeCoins = exchangesCoins[exchangeName];

      Object.keys(exchangeCoins).forEach(coinName => {
        // console.log(`Coin: ${coinName}`);
        if (Array.isArray(exchangeCoins[coinName])) {
          exchangeCoins[coinName].forEach(pairCoinName => {

            if (coinName === pairCoinName) {
              console.log(`Ignoring identical pair in exchange ${exchangeName}: ${coinName}/${pairCoinName}`);
              return;
            }

            addPairToCoin(coinName, pairCoinName, exchangeName, coinsMap);
          });
        } else {
          console.error(`Unreadable coin pair in exchange: ${exchangeName}: ${coinName}`, exchangeCoins[coinName]);
        }

      });

      return coinsMap;

    }, {});

  } catch (error) {
    console.error('Failed to fetch data from CryptoCompare', error);
    return {};
  }

}

function flattenCoinsMap(coinsMap) {
  return Object.keys(coinsMap).map(coinName => {
    try {
      return {
        coinName,
        exchangesNum: coinsMap[coinName].exchanges.size,
        uniqueCryptoPairsNum: coinsMap[coinName].uniqueCryptoPairs.size,
        uniqueFiatPairsNum: coinsMap[coinName].uniqueFiatPairs.size,
        allUniquePairsNum: coinsMap[coinName].uniqueCryptoPairs.size + coinsMap[coinName].uniqueFiatPairs.size,
        allPairs: coinsMap[coinName].allPairs
      };
    } catch (error) {
      console.log(`Failed to flatten coin ${coinName}`, coinsMap[coinName], error);
      return {
        coinName,
        exchangesNum: 0,
        uniqueCryptoPairsNum: 0,
        uniqueFiatPairsNum: 0,
        allUniquePairsNum: 0,
        allPairs: 0
      };
    }
  });
}

module.exports = {
    mapCoinsPairs,
    flattenCoinsMap
};