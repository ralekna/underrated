const {mapCoinsPairs} = require('./../pairs/pairs-index');
const {getCoinMarketCapData} = require('./../market/cmc-data');

module.exports = {
  getAggregatedData
};

async function getAggregatedData() {
  let cmcData,
      pairData;

  try {
    [cmcData, pairData] = await Promise.all([getCoinMarketCapData(), mapCoinsPairs()]);

  } catch (error) {
    console.error(`An error occurred while retrieving data`, error);
    return [];
  }
}
