#!/usr/bin/env node

const minimist = require('minimist');

let argv = minimist(process.argv.slice(2));

let limit = argv['l'] || argv['limit'];

switch (true) {

  case argv['v'] || argv['version']:
    require('./scripts/print-version').printVersion();
    break;

  case argv['pairs'] || argv._.includes('pairs'):
    limit = limit || 100;
    require('./scripts/print-pairs').printPairsIndex(limit);
    break;

  case argv['stats'] || argv._.includes('stats') || argv._.length === 0:
    limit = limit || 100;
    require('./scripts/print-stats').printStats(limit);
    break;

  case argv['help'] || argv['h'] || argv._.includes('help'):
    require('./scripts/print-help').printHelp();
    break;

  default:
    console.log(`Unknown command [${argv._.join(' ')}]`);
    require('./scripts/print-help').printHelp();
    break;
}
