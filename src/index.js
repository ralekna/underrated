const request = require('request-promise-native');
const printf = require('printf');

const colors = {
  'green': ''
};

(async () => {
    let allData;

    console.log('Retrieving data from CoinMarketCap...\n');
    try {
        allData = JSON.parse(await request('https://api.coinmarketcap.com/v1/ticker/?limit=0'));
    } catch (error) {
        console.error(`An error occurred while retrieving data ${error}`);
        return;
    }
    
    const bitCoinData = allData.find(item => item.symbol === 'BTC');

    const btcSupply = parseFloat(bitCoinData['available_supply']);
    const btcVolume = parseFloat(bitCoinData['24h_volume_usd']);
    const btcPrice = parseFloat(bitCoinData['price_usd']);


    // btcTotalSupply / coinTotalSupply * (1 - coinPrice/btcPrice) * (coinVolumeUsd / coinCapitalizationUsd) * (coin24HoursUsdVolume / btc24HoursUsdVolume)

    console.log(`BitCoin stats`);
    console.log(`Price USD: ${bitCoinData.price_usd} supply: ${bitCoinData.available_supply} volume 24 USD: ${bitCoinData['24h_volume_usd']}\n`);

    console.log(`    Symbol |               Name |  price USD |         supply |  volume 24 USD`);
    console.log(`------------------------------------------------------------------------------`);

    let maxSupplyRatio;
    let maxPriceRatio;
    let maxVolumeRatio;
    let maxBtcVolumeRatio;

    let processedData = allData.map(data => {
        let price = parseFloat(data['price_usd']);
        let supply = parseFloat(data['available_supply']);
        let volume = parseFloat(data['24h_volume_usd']);

        let supplyRatio = btcSupply / supply;
        let priceRatio = (1 - parseFloat(data['price_btc']));
        let volumeRatio = volume / parseFloat(data['market_cap_usd']);
        let btcVolumeRatio = parseFloat(data['24h_volume_usd']) / btcVolume;

        supplyRatio = isNaN(supplyRatio) ? 0 : supplyRatio;
        priceRatio = isNaN(priceRatio) ? 0 : priceRatio;
        volumeRatio = isNaN(volumeRatio) ? 0 : volumeRatio;
        btcVolumeRatio = isNaN(btcVolumeRatio) ? 0 : btcVolumeRatio;

        let index = supplyRatio * priceRatio * volumeRatio * btcVolumeRatio;

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
            volume
        };
    })
    .sort((a, b) => b.index - a.index);

    processedData
    .filter(coin => (coin.supply > 1000000 && coin.volume > 1000000 &&  coin.price < btcPrice))
    .slice(0, 50)
    .forEach(coin => {
        console.log(`${printf('%10s', coin.symbol)} ${printf('%20s', coin.name)}    ${printf('%10s', coin.price.toFixed(5))}   ${printf('%14s', parseInt(coin.data.available_supply))} ${printf('%16s', parseInt(coin.data['24h_volume_usd']))}| S: ${coin.supplyRatio.toFixed(5)} | P: ${coin.priceRatio.toFixed(5)} | V: ${coin.volumeRatio.toFixed(5)} | VB: ${coin.btcVolumeRatio.toFixed(5)}`);
    });
    console.log(`------------------------------------------------------------------------------\n`);


})();



