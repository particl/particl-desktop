const log = require('electron-log');
const config = require('../daemon/daemonConfig');
const cookie = require('../rpc/cookie');
const market = require('particl-marketplace');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;
const importer = require('./importer/importer');

// Stores the child process
let child = undefined;

const _options = config.getConfiguration();

exports.init = function() {
  rxIpc.registerListener('start-market', function(walletName) {
    return Observable.create(observer => {
      exports.start(walletName);
      observer.complete(true);
    });
  });

  rxIpc.registerListener('stop-market', function() {
    return Observable.create(observer => {
      exports.stop();
      observer.complete(true);
    });
  });
}

exports.start = function(walletName) {
  if (!_options.skipmarket && !child) {
    log.info('market process starting.');

    const isTestnet = Boolean(+_options.testnet);
    const cookieFile = cookie.getCookieName(_options);

    const marketOptions = {
      ELECTRON_VERSION: process.versions.electron,
      DEFAULT_WALLET: String(walletName) || '',
      DEFAULT_MARKETPLACE_NAME: 'DEFAULT',
      RPCHOSTNAME: _options.rpcbind || 'localhost',
      RPC_PORT: _options.port,
      TESTNET: isTestnet,
      RPCCOOKIEFILE: cookieFile,
      STANDALONE: true,
      SOCKETIO_ENABLED: true
    };

    if (isTestnet) {
      marketOptions.TESTNET_PORT = _options.port;
      marketOptions.DEFAULT_MARKETPLACE_PRIVATE_KEY = '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek';
      marketOptions.DEFAULT_MARKETPLACE_ADDRESS = 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA';
    } else {
      marketOptions.MAINNET_PORT = _options.port;
      marketOptions.NODE_ENV = 'PRODUCTION';
      marketOptions.SWAGGER_ENABLED = false;
      // DEFAULT_MARKETPLACE_PRIVATE_KEY and DEFAULT_MARKETPLACE_ADDRESS for now are extracted from the default MP environment
    }

    if (_options.rpcuser) {
      marketOptions.RPCUSER = _options.rpcuser;
    }
    if (_options.rpcpassword) {
      marketOptions.RPCPASSWORD = _options.rpcpassword;
    }

    child = market.start(marketOptions);

    child.on('close', code => {
      log.info('market process ended.');
    });

    child.stdout.on('data', data => console.log(data.toString('utf8')));
    child.stderr.on('data', data => console.log(data.toString('utf8')));

    importer.init();
  }
}

exports.stop = async function() {
  if (!_options.skipmarket && child) {
    log.info('market process stopping.');
    market.stop();
    child = null;

    importer.destroy();
  }
}
