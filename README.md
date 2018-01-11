# UnderRated

this is a command line utility to to sort and display results from [https://www.coinmarketcap.com] by using this index:
`(1 - coinMarketCapUsd / btcMarketCapUsd) * (coin24HoursUsdVolume / btc24HoursUsdVolume) * (coinExchanges / btcExchanges) * (coinFiatPairs / btcFiatPairs)`

The bigger index - the higher position in list

## Installation

Install Node.js on your computer

Open terminal/command-prompt/command-line and run `npm install -g underrated`

Done.

## Running

Open terminal/command-prompt/command-line and run `underrated stats` or just `underrated` for capitalization and volumes tats

![Sample output of program](https://i.imgur.com/5TAmNrd.png)


Run `underrated pairs` for exchange pairs and exchanges stats

![Sample output of program](https://i.imgur.com/FcCri4V.png)

More commands and data to come soon

![Build status](https://api.travis-ci.org/ralekna/underrated.svg?branch=master)
