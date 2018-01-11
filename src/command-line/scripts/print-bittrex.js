const {getSummary, fetchSummaries} = require('../../market/bittrex');
const printf = require('printf');

async function printBittrexMarkets() {

  try {

    let summaries = getSummary(await fetchSummaries());
    summaries
      .filter(market => !!~market.name.indexOf('BTC-'))
      .sort((a, b) => b.price - a.price)
      .forEach((market, index) => {
        console.log(`${printf('%3d', index)}  ${printf('%12s', market.name)} | ${printf('%20s', market.price.toFixed(8))} | ${printf('%12d', market.baseVolume)}`);
      })

  } catch (error) {
    console.error(error, `Failed to load data from Bittrex`);
  }

}

module.exports = {
  printBittrexMarkets
};
