const packageJson = require('../../package.json');

module.exports = {
  printVersion() {
    console.log(packageJson.version);
  }
};