const log = require('electron-log');
const config = require('../daemon/daemonConfig');
const cookie = require('../rpc/cookie');
const market = require('particl-marketplace');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs').Observable;
// const importer = require('./importer/importer');

// Stores the child process
let child = undefined;
let doStartupCheck = true;


exports.init = function() {
  exports.destroy();
  rxIpc.registerListener('start-market', function(appPort, zmqPort) {
    return Observable.create(observer => {
      if (child !== undefined) {
        // if doStartCheckup === true, it means that the child process has not yet started correctly.
        observer.next(!doStartupCheck);
        return;
      }

      start(appPort, zmqPort);

      if (!child) {
        observer.error({code: -1, message: 'Generic start failure'});
        observer.complete();
      }

      child.on('close', code => {
        log.info('market process ended.');
        if (doStartupCheck) {
          // market process is shutdown before obtaining the "ready" signal
          observer.next(false);
          observer.complete();
        }
      });

      child.stdout.on('data', data => {
        console.log(data.toString('utf8'));
        if (doStartupCheck && data.toString('utf8').includes('App is ready!')) {
          doStartupCheck = false;
          observer.next(true);
          observer.complete();
        }

      });
      child.stderr.on('data', data => {
        console.log(data.toString('utf8'));
        if (doStartupCheck) {
          observer.error('An unexpected error occurred');
          observer.complete();
        }
      });
    });
  });

  rxIpc.registerListener('stop-market', function() {
    return Observable.create(observer => {
      stop();
      observer.complete();
    });
  });
}


exports.destroy = function() {
  stop();
  rxIpc.removeListeners('start-market');
  rxIpc.removeListeners('stop-market');
}


function start(appPort, zmqPort) {
  log.info('market process start requested');

  const _options = config.getConfig();

  const isTestnet = Boolean(+_options.testnet);
  const cookieFile = cookie.getCookieName(_options);

  const marketOptions = {
    ELECTRON_VERSION: process.versions.electron,
    RPCHOSTNAME: _options.rpcbind || 'localhost',
    RPC_PORT: _options.port,
    TESTNET: isTestnet,
    RPCCOOKIEFILE: cookieFile,
    SOCKETIO_ENABLED: true,
    APP_HOST: 'http://localhost',
    APP_URL_PREFIX: '/api'
  };

  if (typeof _options.rpcuser === 'string' && _options.rpcuser.length) {
    marketOptions.RPCUSER = _options.rpcuser;
  }
  if (typeof _options.rpcpassword === 'string' && _options.rpcpassword.length) {
    marketOptions.RPCPASSWORD = _options.rpcpassword;
  }

  if ( (typeof appPort === 'number') && (appPort > Math.floor(0))) {
    marketOptions.APP_PORT = Math.floor(appPort);
  }

  if ( (typeof zmqPort === 'number') && (zmqPort > Math.floor(0))) {
    marketOptions.ZMQ_PORT = Math.floor(zmqPort);
  }

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

  child = market.start(marketOptions);

  // importer.init();
}


function stop() {
  if (child) {
    log.info('market process stopping.');
    market.stop();
    child = undefined;
    doStartupCheck = true;

    // importer.destroy();
  }
}
