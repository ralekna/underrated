const request = require('request-promise-native');
const printf = require('printf');

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


    // btcSup/sup + (1-price/btcPrice) + volume/btcVolume
    // btcSup/sup + (1-price/btcPrice) + volume_usd/cap_usd

    console.log(`BitCoin stats`);
    console.log(`Price USD: ${bitCoinData.price_usd} supply: ${bitCoinData.available_supply} volume 24 USD: ${bitCoinData['24h_volume_usd']}\n`);

    console.log(`    Symbol |               Name |       Index  |  price USD |         supply |  volume 24 USD`);
    console.log(`---------------------------------------------------------------------------------------------`);



    allData.map(data => {
        let price = parseFloat(data['price_usd']);

        let suplyRatio = btcSupply/parseFloat(data['available_supply']);
        let priceRatio = (1 - parseFloat(data['price_btc']));
        let volumeRatio = parseFloat(data['24h_volume_usd']) / parseFloat(data['market_cap_usd']);
        let btcVolumeRatio = parseFloat(data['24h_volume_usd']) / btcVolume;

        suplyRatio = isNaN(suplyRatio) ? 0 : suplyRatio;
        priceRatio = isNaN(priceRatio) ? 0 : priceRatio;
        volumeRatio = isNaN(volumeRatio) ? 0 : volumeRatio;
        btcVolumeRatio = isNaN(btcVolumeRatio) ? 0 : btcVolumeRatio;

        let index = (suplyRatio * priceRatio) * volumeRatio * btcVolumeRatio;

        return {
            price: price.toFixed(5),
            symbol: data.symbol,
            name: data.name,
            index,
            data
        };
    })
    .sort((a, b) => b.index - a.index)
    .slice(0, 30)
    .forEach(coin => {
        console.log(`${printf('%10s', coin.symbol)} ${printf('%20s', coin.name)}    ${printf('%10s', coin.index.toFixed(3))}    ${printf('%10s', coin.price)}   ${printf('%14s', parseInt(coin.data.available_supply))} ${printf('%16s', parseInt(coin.data['24h_volume_usd']))}`);
    });
    console.log(`------------------------------------------------------------------------------------------`);
})();



