const request = require('request-promise-native');
const printf = require('printf');
const {mapCoinsPairs, flattenCoinsMapToMap} = require('../../pairs/pairs-index');

module.exports = { printStats };

/**
 * TODO:
 * coloring
 * available markets
 * available exchange currencies (pairs)
 * google results
 * volatility index
 */

async function printStats({limit, includePairsStats} = {limit: Number.MAX_SAFE_INTEGER, includePairsStats: false}) {
  let allData;
  let pairData;
  console.log('Retrieving data from CoinMarketCap...\n');
  try {
    [allData, pairData] = await Promise.all([request.get('https://api.coinmarketcap.com/v1/ticker/?limit=0'), mapCoinsPairs()]);

    allData = JSON.parse(allData);
  } catch (error) {
    console.error(`An error occurred while retrieving data`, error);
    return;
  }

  console.log(`Retrieved ${allData.length} currencies`);

  let pairsMap;
  try {
    pairsMap = flattenCoinsMapToMap(pairData);
  } catch (error) {
    console.log(`Failed to flatten`, error);
  }

  let btcPairsStats = pairsMap['BTC'];

  const bitCoinData = allData.find(item => item.symbol === 'BTC');

  const btcSupply = parseFloat(bitCoinData['available_supply']);
  const btcVolume = parseFloat(bitCoinData['24h_volume_usd']);
  const btcPrice = parseFloat(bitCoinData['price_usd']);
  const btcCap = parseFloat(bitCoinData['market_cap_usd']);
  const btcSelfVolumeRatio = btcVolume / btcCap;

  console.log(`BitCoin stats`);
  console.log(`Price USD: ${bitCoinData.price_usd} supply: ${bitCoinData.available_supply} volume 24 USD: ${bitCoinData['24h_volume_usd']}\n`);

  console.log(`
        Index fractions meaning:
        S  - supply: (coinCurrentSupply / coinMaxSupply)
        V  - volume: (coinVolumeUsd / coinCapitalizationUsd)
        VB - BTC volume: (coin24HoursUsdVolume / btc24HoursUsdVolume)
        C  - Capitalization against BTC ratio: (1 - coinMarketCapUsd / btcMarketCapUsd)
        
        PI - Pairs index - how many exchanges and and how many fiat currencies pairs available compared to Bitcoin: (exchangesRatio * fiatPairsRatio)
        I  - Index: raw index that is used for sort
        
        CMC rank - coinmarketcap.com rank
        
        Yellow price indicates prices bellow $1
        Yellow VB indicates volumes bigger then 0.01 BTC volume
        Yellow C indicates capitalization lower then 0.001 BTC capitalization
    `);

  console.log(`No.  |  Symbol |                         Name |   price USD |         supply |  volume 24 USD |  CMC rank | Index fractions`);
  console.log(`------------------------------------------------------------------------------------------------------------------------------------------`);

  function color(flag, value) {
    return (flag ? '\x1b[33m' : '') + value + '\x1b[0m';
  }

  let processedData = allData.map(data => {
    let price = parseFloat(data['price_usd']);
    let supply = parseFloat(data['available_supply']);
    let maxSupply = parseFloat(data['max_supply'] || data['available_supply']);
    let volume = parseFloat(data['24h_volume_usd']);
    let rank = parseInt(data['rank']);
    let cap = parseFloat(data['market_cap_usd']);
    let ch1h = parseFloat(data['percent_change_1h']);
    let ch24h = parseFloat(data['percent_change_24h']);
    let ch7d = parseFloat(data['percent_change_7d']);

    let supplyRatio = supply / maxSupply;
    let priceRatio = (1 - parseFloat(data['price_btc'])) + Number.EPSILON; // adding EPSILON to avoid zeroing of BTC price index
    let volumeRatio = volume / cap;
    let btcVolumeRatio = parseFloat(data['24h_volume_usd']) / btcVolume;
    let capRatio = (2 - cap / btcCap);

    // capRatio = capRatio === 0 ? Number.EPSILON : capRatio;

    // Right now it's disabled but in future it will be possible to add optional fraction  of popularity in in CMP
    let rankRatio = Math.sqrt(1 / rank);

    supplyRatio = isNaN(supplyRatio) ? 0 : supplyRatio;
    priceRatio = isNaN(priceRatio) ? 0 : priceRatio;
    volumeRatio = isNaN(volumeRatio) ? 0 : volumeRatio;
    btcVolumeRatio = isNaN(btcVolumeRatio) ? 0 : btcVolumeRatio;

    let exchangesRatio    = pairsMap[data.symbol] ? (pairsMap[data.symbol].exchangesNum / btcPairsStats.exchangesNum) : 0;
    let cryptoPairsRatio  = pairsMap[data.symbol] ? (pairsMap[data.symbol].uniqueCryptoPairsNum / btcPairsStats.uniqueCryptoPairsNum) : 0;
    let fiatPairsRatio    = pairsMap[data.symbol] ? (pairsMap[data.symbol].uniqueFiatPairsNum / btcPairsStats.uniqueFiatPairsNum) : 0;
    let allPairsRatio    = pairsMap[data.symbol] ? (pairsMap[data.symbol].allPairs / btcPairsStats.allPairs) : 0;

    let pairsIndex = (exchangesRatio * fiatPairsRatio); // * allPairsRatio * cryptoPairsRatio );

    // let index = supplyRatio * priceRatio * volumeRatio * btcVolumeRatio; //  * rankRatio;
    // let index = capRatio; // * volumeRatio * btcVolumeRatio; //  * rankRatio;
    let index = capRatio * pairsIndex * btcVolumeRatio; //  * rankRatio;

    return {
      symbol: data.symbol,
      name: data.name,
      index,
      data,
      supplyRatio: supplyRatio,
      priceRatio,
      volumeRatio,
      btcVolumeRatio,
      price,
      supply,
      volume,
      rank,
      capRatio,
      pairsIndex,
      ch1h,
      ch24h,
      ch7d
    };
  })
  .filter(coin => ![coin.index, coin.supply, coin.price, coin.volume].some(isNaN)) // filtering out currencies that doesn't provide enough information
  .sort((a, b) => b.index - a.index);

  processedData
  // TODO: make sanity filtering (optional)
  // sanity check
  // filtering out currencies that are more expensive then BTC, very low supply or volume
  // .filter(coin => (coin.supply > 1000000 && coin.volume > 1000000 &&  coin.price <= btcPrice))

  .slice(0, limit)
  .forEach((coin, index) => {
    try {
      console.log(`${printf('%4d', index + 1)}  ${printf('%8s', coin.symbol)} ${printf('%30s', coin.name)}  ${color(coin.price < 1, printf('%12s', coin.price.toFixed(5)))}   ${printf('%14s', parseInt(coin.data.available_supply))} ${printf('%16s', parseInt(coin.data['24h_volume_usd']))}        ${printf('%4s', coin.rank)} | S: ${coin.supplyRatio.toFixed(10)} | V: ${color(coin.volumeRatio > btcSelfVolumeRatio, coin.volumeRatio.toFixed(10))} | VB: ${color(coin.btcVolumeRatio > 0.01, coin.btcVolumeRatio.toFixed(10))} | C: ${color(coin.capRatio > 1.999, (2 - coin.capRatio).toFixed(10))} | 1h: ${color(coin.ch1h > 10, printf('%6.2f', coin.ch1h))} | 24h: ${color(coin.ch24h < 20, printf('%6.2f', coin.ch24h))} | 7d: ${color(coin.ch7d < 50, printf('%6.2f', coin.ch7d))} | PI: ${color(coin.pairsIndex > 0.001, coin.pairsIndex.toFixed(10))} | I: ${coin.index.toFixed(10)}`);
    } catch (error) {
      console.error(`${printf('%4d', index + 1)}  ${printf('%8s', coin.symbol)} missing data`); // , JSON.stringify(coin, null, 4)
    }

  });
  console.log(`------------------------------------------------------------------------------------------------------------------------------------------`);
}
