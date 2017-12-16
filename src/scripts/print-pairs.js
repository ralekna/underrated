const {flattenCoinsMap, mapCoinsPairs} = require('../pairs/pairs-index');
const printf = require('printf');

async function printPairsIndex(limit) {
  let coinsMap = await mapCoinsPairs();
  console.log(`Retrieved coins map`);
  let pairsList = flattenCoinsMap(coinsMap);

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

module.exports = {
  printPairsIndex
};