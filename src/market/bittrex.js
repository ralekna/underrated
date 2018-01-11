const request = require('request-promise-native');

async function fetchSummaries() {
  return JSON.parse(await request.get(`https://bittrex.com/api/v1.1/public/getmarketsummaries`)).result;
}

function getSummary(allData) {
  return allData.map(market => ({
    name: market['MarketName'],
    price: market['Last'],
    baseVolume: market['BaseVolume']
  }));
}

module.exports = {
  getSummary,
  fetchSummaries
};
