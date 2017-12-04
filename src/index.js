#!/usr/bin/env node

const request = require('request-promise-native');
const printf = require('printf');

/**
 * TODO:
 * coloring
 * available markets
 * available exchange currencies (pairs)
 * google results
 * volatility index
 */

(async () => {
    let allData;

    console.log('Retrieving data from CoinMarketCap...\n');
    try {
        allData = JSON.parse(await request('https://api.coinmarketcap.com/v1/ticker/?limit=0'));
    } catch (error) {
        console.error(`An error occurred while retrieving data ${error}`);
        return;
    }

    console.log(`Retrieved ${allData.length} currencies`);

    const bitCoinData = allData.find(item => item.symbol === 'BTC');

    const btcSupply = parseFloat(bitCoinData['available_supply']);
    const btcVolume = parseFloat(bitCoinData['24h_volume_usd']);
    const btcPrice = parseFloat(bitCoinData['price_usd']);


    // (btcTotalSupply / coinTotalSupply) * (1 - coinPrice/btcPrice) * (coinVolumeUsd / coinCapitalizationUsd) * (coin24HoursUsdVolume / btc24HoursUsdVolume)

    console.log(`BitCoin stats`);
    console.log(`Price USD: ${bitCoinData.price_usd} supply: ${bitCoinData.available_supply} volume 24 USD: ${bitCoinData['24h_volume_usd']}\n`);

    console.log(`
        Index fractions meaning:
        S  - supply: (btcTotalSupply / coinTotalSupply)
        P  - price: (1 - coinPrice/btcPrice)
        V  - volume: (coinVolumeUsd / coinCapitalizationUsd)
        VB - BTC volume: (coin24HoursUsdVolume / btc24HoursUsdVolume)
        
        CMC rank - coinmarketcap.com rank
    `);

    console.log(`No.  |  Symbol |                         Name |   price USD |         supply |  volume 24 USD |  CMC rank | Index fractions`);
    console.log(`------------------------------------------------------------------------------------------------------------------------------------------`);

    let maxSupplyRatio;
    let maxPriceRatio;
    let maxVolumeRatio;
    let maxBtcVolumeRatio;

    let processedData = allData.map(data => {
        let price = parseFloat(data['price_usd']);
        let supply = parseFloat(data['available_supply']);
        let volume = parseFloat(data['24h_volume_usd']);
        let rank = parseInt(data['rank']);

        let supplyRatio = btcSupply / supply;
        let priceRatio = (1 - parseFloat(data['price_btc'])) + Number.EPSILON; // adding EPSILON to avoid zeroing of BTC price index
        let volumeRatio = volume / parseFloat(data['market_cap_usd']);
        let btcVolumeRatio = parseFloat(data['24h_volume_usd']) / btcVolume;

        // Right now it's disabled but in future it will be possible to add optional fraction  of popularity in in CMP
        let rankRatio = Math.sqrt(1 / rank);

        supplyRatio = isNaN(supplyRatio) ? 0 : supplyRatio;
        priceRatio = isNaN(priceRatio) ? 0 : priceRatio;
        volumeRatio = isNaN(volumeRatio) ? 0 : volumeRatio;
        btcVolumeRatio = isNaN(btcVolumeRatio) ? 0 : btcVolumeRatio;

        let index = supplyRatio * priceRatio * volumeRatio * btcVolumeRatio; //  * rankRatio;

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
            rank
        };
    })
    .sort((a, b) => b.index - a.index);

    processedData
    // TODO: make sanity filtering (optional)
    // sanity check
    // filtering out currencies that are more expensive then BTC, very low supply or volume
    // .filter(coin => (coin.supply > 1000000 && coin.volume > 1000000 &&  coin.price <= btcPrice))
    .filter(coin => coin.index !== 0) // filtering out currencies that doesn't provide enough information
    .forEach((coin, index) => {
        console.log(`${printf('%4d', index + 1)}  ${printf('%8s', coin.symbol)} ${printf('%30s', coin.name)}  ${printf('%12s', coin.price.toFixed(5))}   ${printf('%14s', parseInt(coin.data.available_supply))} ${printf('%16s', parseInt(coin.data['24h_volume_usd']))}        ${printf('%4s',coin.rank)} | S: ${coin.supplyRatio.toPrecision(10)} | P: ${coin.priceRatio.toPrecision(10)} | V: ${coin.volumeRatio.toPrecision(10)} | VB: ${coin.btcVolumeRatio.toPrecision(10)}`);
    });
    console.log(`------------------------------------------------------------------------------------------------------------------------------------------`);


})();



