const {underscoreToCamelCaseKeys, renameKey, trim} = require('./../util/object-transform');
const request = require('request-promise-native');

const ALL_RAW_PROPS = Object.freeze([
  "id",
  "name",
  "symbol",
  "rank",
  "price_usd",
  "price_btc",
  "24h_volume_usd",
  "market_cap_usd",
  "available_supply",
  "total_supply",
  "percent_change_1h",
  "percent_change_24h",
  "percent_change_7d",
  "last_updated"]);

const NEEDED_PROPS = Object.freeze([
  "id",
  "name",
  "symbol",
  "rank",
  "priceUsd",
  "priceBtc",
  "24hVolumeUsd",
  "marketCapUsd",
  "availableSupply",
  "totalSupply",
  "percentChange1h",
  "percentChange24h",
  "percentChange7d",
  "lastUpdated"]);

const NUMBER_PROPS = Object.freeze([
  "rank",
  "priceUsd",
  "priceBtc",
  "volumeUsd24h",
  "marketCapUsd",
  "availableSupply",
  "totalSupply",
  "percentChange1h",
  "percentChange24h",
  "percentChange7d",
  "lastUpdated"]);

function parseFloatOrNull(number) {
  if (number === null) {
    return null;
  } else {
    return parseFloat(number)
  }
}

async function getCoinMarketCapData() {
  let rawData;
  try {
    rawData = JSON.parse(await request.get('https://api.coinmarketcap.com/v1/ticker/?limit=0'));
  } catch (error) {
    console.error(`An error occurred while retrieving data`, error);
    return [];
  }

  return rawData.map((data) => {
    let coinData = underscoreToCamelCaseKeys(data);
    renameKey(coinData, '24hVolumeUsd', 'volumeUsd24H');

    NUMBER_PROPS.forEach(prop => coinData[prop] = parseFloatOrNull(coinData[prop]));

    return coinData;
  });
}

module.exports = {
  getCoinMarketCapData
};
