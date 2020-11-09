const log = require('electron-log');
const config = require('../daemon/daemonConfig');
const cookie = require('../rpc/cookie');
const market = require('particl-marketplace');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs').Observable;
const bitcore = require('particl-bitcore-lib');
const importer = require('./importer/importer');

// @TODO: zaSmilingIdiot 2020-03-18 -> This entire process is a mess, and needs to be done over! It works for its current purpose, but is really brittle, crappy code!

const DEFAULT_TIMEOUT = 20 ;// wait at least this many seconds before deeming the MP to have failed starting (in case of a start error)

// Stores the child process
let child = undefined;
let isStarted = null;
let timeoutMonitor = null;


exports.init = function() {
  exports.destroy();
  importer.init();
  rxIpc.registerListener('start-market', function(appPort, zmqPort, timeout) {
    return Observable.create(observer => {

      const startWaitDuration = (+timeout < DEFAULT_TIMEOUT ? DEFAULT_TIMEOUT : +timeout) * 1000;

      if (child !== undefined) {
        if (isStarted !== null) {
          observer.next(isStarted);
          observer.complete();
        }
        return;
      }

      start(appPort, zmqPort);

      if (!child) {
        observer.error({code: -1, message: 'Generic start failure'});
        observer.complete();
      }

      child.on('close', code => {
        log.info('market process ended.');
        if ((isStarted === null) && !observer.closed) {
          // market process is shutdown before obtaining the "ready" signal
          observer.next(false);
          observer.complete();
        }
        resetTimeoutCheck();
      });

      child.stdout.on('data', data => {
        console.log(data.toString('utf8'));

        // @TODO: zaSmilingIdiot 2020-03-20 -> Replace this with a more applicable string.
        //  The problem is that the 'App is ready' string is output before the app is actually ready,
        //    and technically, the 'bootstrap(), DONE!' string is a debug() loglevel output.
        if ((isStarted === null) && data.toString().includes('bootstrap(), DONE')) {
          isStarted = true;
          resetTimeoutCheck();
          observer.next(true);
          observer.complete();
        }

        if ((isStarted === null) && data.toString().includes('ERROR: marketplace bootstrap failed')) {
          // Seems to be the error string that gets emitted when the MP fails to launch
          isStarted = false;
          resetTimeoutCheck();
          observer.next(false);
          observer.complete();
        }
      });

      child.stderr.on('data', data => console.log(data.toString('utf8')));

      // If app is not started correctly in x seconds, stop and return a fail
      timeoutMonitor = setTimeout(function () {
        if (isStarted === null) {
          stop();
        }
        resetTimeoutCheck();
        if (!observer.closed) {
          observer.error('MP_STARTUP_FAILURE');
          observer.complete();
        }
      }, startWaitDuration);
    });
  });

  rxIpc.registerListener('stop-market', function() {
    return Observable.create(observer => {
      stop();
      observer.complete();
    });
  });


  rxIpc.registerListener('market-keygen', function(keyTypeRequired /* 'PRIVATE' | 'PUBLIC' */, fromKey /* string */ ) {
    return Observable.create(observer => {
      if ((typeof keyTypeRequired !== 'string') || !['PUBLIC'].includes(keyTypeRequired) || (typeof fromKey !== 'string')) {
        observer.error('MP_KEYGEN_INVALID_PARAMS');
      } else {
        try {
          let newKey;
          switch (keyTypeRequired) {
            case 'PUBLIC': newKey = bitcore.PrivateKey.fromWIF(fromKey).toPublicKey().toString(); break;
          }
          if ((typeof newKey !== 'string') || !(newKey.length > 0)) {
            throw new Error('something went wrong');
          } else {
            observer.next(newKey);
          }

        } catch (err) {
          observer.error('MP_KEYGEN_INVALID_KEY');
        }
        observer.complete();
      }
    });
  });
}


exports.destroy = function() {
  importer.destroy();
  rxIpc.removeListeners('start-market');
  rxIpc.removeListeners('stop-market');
  rxIpc.removeListeners('market-keygen');
  stop();
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
    marketOptions.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY = '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek';
    marketOptions.APP_DEFAULT_MARKETPLACE_ADDRESS = 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA';
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
    isStarted = null;

    resetTimeoutCheck();

    // importer.destroy();
  }
}


function resetTimeoutCheck() {
  if (timeoutMonitor !== null) {
    clearTimeout(timeoutMonitor);
    timeoutMonitor = null;
  }
}
