const {flattenCoinsMapToList, mapCoinsPairs, getSingleCoinPairs} = require('../../pairs/pairs-index');
const printf = require('printf');

async function printPairsIndex(limit) {
  let coinsMap = await mapCoinsPairs();
  console.log(`Retrieved coins map`);
  let pairsList = flattenCoinsMapToList(coinsMap);

  let maxStats = {
    uniqueCryptoPairsNum: 0,
    uniqueFiatPairsNum: 0,
    allPairs: 0
  };

  console.log(`Coin     | All unique pairs | All crypto pairs | All fiat pairs | Exchanges`);
  console.log(`---------------------------------------------------------------------------`);
  pairsList
    .sort((a, b) => b.allUniquePairsNum - a.allUniquePairsNum)
    .slice(0, limit)
    .forEach(coin => {
  console.log(`${printf('%8s', coin.coinName)} |         ${printf('%8d', coin.allUniquePairsNum)} |         ${printf('%8d', coin.uniqueCryptoPairsNum)} |       ${printf('%8d', coin.uniqueFiatPairsNum)} |  ${printf('%8d', coin.exchangesNum)}`);
    })
}

async function printOneCoinPairs(coinName) {
  let coinPairStats = await getSingleCoinPairs(coinName);
  // console.log(JSON.stringify(coinPairStats, 4));
  console.log('Printing one pair: ', coinName);
  let stringified = JSON.stringify(coinPairStats, function(key, value) {
    // console.log('value is set: ', key, value instanceof Set);
    if (typeof value === 'object' && value instanceof Set) {
      return [...value];
      // return Array.from(value.values()).join(', ');
    }
    return value;
  }, 2);
  console.log(stringified);
}

module.exports = {
  printPairsIndex,
  printOneCoinPairs
};