const log         = require('electron-log');
const _options    = require('../options').get();
const market      = require('particl-marketplace');
const app         = require('electron').app;

// Stores the child process
let child = undefined;

exports.init = function() {

  if (!_options.skipmarket) {
    log.info('market process starting.');
    const marketOptions = {
      ELECTRON_VERSION: process.versions.electron,
      RPCHOSTNAME: _options.rpcbind || 'localhost',
      RPC_PORT: _options.rpcport,
      TESTNET: _options.testnet || app.getVersion().includes('testnet')
    };
    child = market.start(marketOptions);

    child.on('close', code => {
      log.info('market process ended.');
    });

    child.stdout.on('data', data => console.log(data.toString('utf8')));
    child.stderr.on('data', data => console.log(data.toString('utf8')));
  }
}

exports.stop = async function() {
  if (!_options.skipmarket && child) {
    market.stop();
  }
}

// TODO: Export startup function..
