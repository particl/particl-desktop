const log = require('electron-log');
const config = require('../daemon/daemonConfig');
const cookie = require('../rpc/cookie');
const market = require('particl-marketplace');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

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
      WALLET: String(walletName) || '',
      RPCHOSTNAME: _options.rpcbind || 'localhost',
      RPC_PORT: _options.port,
      TESTNET: isTestnet,
      RPCCOOKIEFILE: cookieFile
    };

    if (isTestnet) {
      marketOptions.TESTNET_PORT = _options.port;
    } else {
      marketOptions.MAINNET_PORT = _options.port;
      marketOptions.NODE_ENV = 'PRODUCTION';
      marketOptions.SWAGGER_ENABLED = false;
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
  }
}

exports.stop = async function() {
  if (!_options.skipmarket && child) {
    log.info('market process stopping.');
    market.stop();
    child = null;
  }
}
