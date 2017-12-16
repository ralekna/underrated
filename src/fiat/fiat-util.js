const fiatData = require('./fiat-currencies.json');

module.exports = {
  isFiat(symbol) {
    return !!fiatData[symbol];
  }
};