#!/usr/bin/env node

const minimist = require('minimist');

let argv = minimist(process.argv.slice(2));

switch (true) {
  case argv['help'] || argv['h'] || argv._.includes('help'):
    require('./scripts/print-help').printHelp();
    break;
  case argv['v'] || argv['version']:
    require('./scripts/print-version').printVersion();
    break;
  case argv['stats'] || argv._.includes('stats'):
  default:
    let limit = argv['l'] || argv['limit'];
    limit = limit || 100;
    require('./scripts/print-stats').printStats(limit);
    break;
}
