const _log              = require('electron-log');
const { Observable, BehaviorSubject }    = require("rxjs");
const _electronStore    = require('electron-store');
const _market           =  require('@zasmilingidiot/particl-marketplace');
const _coreManager      = require('../../coreManager');
const _settingsManager  = require('../../settingsManager');


const START_FIELDS = {
  STOPPED: 0,
  STARTED: 1,
  STARTING: 2,
  STOPPING: 3,
}

let _childProc;
let startStatus$;
let stateRef;
let timeoutMonitor = null;


const DEFAULT_TIMEOUT = 120;
const DEFAULT_PORT = 45492;


const SETTING_SCHEMA = {
  network: {
    type: 'object',
    properties: {
      port: {
        title: 'Port that the marketplace service will start on',
        type: 'integer',
        minimum: 1025,
        maximum: 65535,
        default: DEFAULT_PORT,
      },
      timeout: {
        title: 'Startup timeout delay (in seconds)',
        description: 'The marketplace service does NOT indicate whether it crashed on startup on not; if the startup has not output certain values within the timeout period then it is assumed to have failed startup.',
        type: 'integer',
        minimum: 20,
        maximum: 900,
        default: DEFAULT_TIMEOUT,
      }
    },
    default: {}
  },
  urls: {
    type: 'object',
    properties: {
      transaction: {
        type: 'object',
        properties: {
          main: {
            type: 'string',
            default: 'https://explorer.particl.io/tx/{txid}',
            pattern: "^((?:http(s)?:\\/\\/)?(\\{txid\\})?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?(\\{txid\\})?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+)?$"
          },
          test: {
            type: 'string',
            default: 'https://explorer-testnet.particl.io/tx/{txid}',
            pattern: "^((?:http(s)?:\\/\\/)?(\\{txid\\})?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?(\\{txid\\})?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+)?$"
          },
          regtest: {
            type: 'string',
            default: '',
            pattern: "^((?:http(s)?:\\/\\/)?(\\{txid\\})?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?(\\{txid\\})?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+)?$"
          }
        },
        required: ['main', 'test'],
        default: {}
      },
    },
    default: {}
  },
};


const errors = {
  starting: ['MP_START_STARTING', 'Duplicate request to start a service already starting.'],
  core: ['CORE_ERROR', 'Invalid Particl Core parameters obtained.'],
  coreConnection: ['CORE_CONNECTION_ERROR', 'Unable to determine Particl Core started status (is Particl Core running?)'],
  startup: ['MP_STARTUP_FAILURE', 'Failed to start service correctly']
};


const isValidObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';


const displayTerminalOutput = (data) => {
  console.log(data.toString('utf8'));
}


const logMessage = (level = 'info', ...msgs) => {
  _log[level]('[market service]', ...msgs);
}


const reportErrorCloseStream = (observer, errorKey, logLevel) => {
  let errCode = 'MP_GENERIC_ERROR';
  let errLogMsg = 'Unknown Failure';
  if (typeof errorKey === 'string' && Array.isArray(errors[errorKey])) {
    errCode = errors[errorKey][0];
    errLogMsg = errors[errorKey][1];
  }
  observer.error(errCode);
  logMessage(logLevel, errLogMsg);
  observer.complete();
}


const stop = () => {
  let isStopping = true;
  if (startStatus$) {
    const currentStatus = startStatus$.getValue();
    isStopping = currentStatus === START_FIELDS.STOPPED || currentStatus === START_FIELDS.STOPPING;
  }

  if (isStopping) {
    return;
  }
  resetTimeoutCheck();
  startStatus$.next(START_FIELDS.STOPPING);
  logMessage('info', 'requesting any open connections to stop.');
  _market.stop();
}


const resetTimeoutCheck = () => {
  if (timeoutMonitor !== null) {
    clearTimeout(timeoutMonitor);
    timeoutMonitor = null;
  }
}


exports.init = () => {
  if (!stateRef) {
    stateRef = new _electronStore({
      schema: SETTING_SCHEMA,
      // migrations: migrations,
      name: 'marketplace',
      cwd: _settingsManager.getSettings(null, 'PATHS').config,
      fileExtension: 'json',
      // clearInvalidConfig: true,
      accessPropertiesByDotNotation: true,
      projectVersion: _settingsManager.getSettings(null, 'VERSIONS').marketplace,
    });
  }

  if (!startStatus$ || startStatus$.closed || startStatus$.isStopped) {
    startStatus$ = new BehaviorSubject(START_FIELDS.STOPPED);
  }

  stop();
}


exports.destroy = function() {
  if (stateRef) {
    stateRef = undefined;
  }
  stop();

  startStatus$.complete();
}


exports.channels = {
  invoke: {
    'start': () => {

      logMessage('info', 'service start requested.');

      return new Observable(observer => {
        const currentStatus = startStatus$.getValue();

        if (currentStatus === START_FIELDS.STARTING) {
          reportErrorCloseStream(observer, 'starting', 'warn');
          return;
        }

        if (currentStatus === START_FIELDS.STARTED) {
          logMessage('info', 'service already started');
          observer.next(true);
          observer.complete();
          return;
        }

        startStatus$.next(START_FIELDS.STARTING);

        const coreSettings = _coreManager.getCoreSettings('particl');

        if (!isValidObject(coreSettings) || !isValidObject(coreSettings.startedParams)) {
          reportErrorCloseStream(observer, 'core', 'error');
          return;
        }

        if (coreSettings.startedParams.started !== 1) {
          reportErrorCloseStream(observer, 'coreConnection', 'error');
          return;
        }

        const ownNetSettings = stateRef ? stateRef.get('network', {}) : {};
        const isTestnet = coreSettings.startedParams.chain === 'test';

        let rpcURL = '127.0.0.1';
        let rpcPort = 0;
        let rpcUser = '';
        let rpcPass = '';
        let zmqPort = 0;

        try {
          const validURL = new URL(coreSettings.startedParams.url);
          rpcURL = `${validURL.hostname}`;
          rpcPort = +validURL.port;
        } catch(_) { }

        let decodedAuth = coreSettings.startedParams.auth;

        try {
          decodedAuth = Buffer.from(coreSettings.startedParams.auth, 'base64').toString('utf8');
        } catch (_) { }

        try {
          const authParts = decodedAuth.split(':');
          rpcUser = authParts[0] || '';
          rpcPass = authParts[1] ? authParts[1] : '';
        } catch(_) { }

        if (('smsg' in coreSettings.startedParams.zmq) && typeof coreSettings.startedParams.zmq.smsg === 'string') {
          const zmqParts = coreSettings.startedParams.zmq.smsg.split(':');
          const zmqp = zmqParts[zmqParts.length - 1];
          if (+zmqp > 0) {
            zmqPort = +zmqp;
          }
        }

        const marketOptions = {
          ELECTRON_VERSION: process.versions.electron,
          RPCHOSTNAME: rpcURL,
          RPC_PORT: rpcPort,
          TESTNET: isTestnet,
          RPCCOOKIEFILE: '.cookie',
          SOCKETIO_ENABLED: true,
          APP_HOST: 'http://localhost',
          APP_URL_PREFIX: '/api',
          APP_PORT: ownNetSettings.port || DEFAULT_PORT,
        };

        if (rpcUser.length > 0) {
          marketOptions.RPCUSER = rpcUser;
        }
        if (rpcPass.length > 0) {
          marketOptions.RPCPASSWORD = rpcPass;
        }

        if (zmqPort > 0) {
          marketOptions.ZMQ_PORT = Math.floor(zmqPort);
        }

        if (isTestnet) {
          marketOptions.TESTNET_PORT = rpcPort;
          marketOptions.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY = '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek';
          marketOptions.APP_DEFAULT_MARKETPLACE_ADDRESS = 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA';
        } else {
          marketOptions.MAINNET_PORT = rpcPort;
          marketOptions.NODE_ENV = 'PRODUCTION';
          marketOptions.SWAGGER_ENABLED = false;
          // DEFAULT_MARKETPLACE_PRIVATE_KEY and DEFAULT_MARKETPLACE_ADDRESS for now are extracted from the default MP environment
        }

        const startWaitDuration = (+ownNetSettings.timeout > 0 ? +ownNetSettings.timeout : DEFAULT_TIMEOUT) * 1000;

        _childProc = _market.start(marketOptions);

        _childProc.stdout.on('data', displayTerminalOutput);
        _childProc.stderr.on('data', displayTerminalOutput);

        const checkStatusFromOutput = (data) => {
          if (data.toString().includes('bootstrap(), done')) {
            _childProc.stdout.off('data', checkStatusFromOutput);
            resetTimeoutCheck();
            startStatus$.next(START_FIELDS.STARTED);
            observer.next(true);
            observer.complete();
          }
          if (data.toString().includes('ERROR: marketplace bootstrap failed')) {
            _childProc.stdout.off('data', checkStatusFromOutput);
            reportErrorCloseStream(observer, 'startup', 'error');
            stop();
          }
        };

        _childProc.stdout.on('data', checkStatusFromOutput);

        _childProc.on('close', code => {
          if ((startStatus$.getValue() === START_FIELDS.STARTING) && !observer.closed) {
            if (timeoutMonitor !== null) {
              // market process is busy starting up and needs to go through the correct error handling (child process closed itself)
              observer.error(errors.startup[0]);
              stop();
            }
            // market process is shutdown before obtaining the "ready" signal
            observer.unsubscribe();
          }
          resetTimeoutCheck();
          startStatus$.next(START_FIELDS.STOPPED);
          logMessage('info', 'service stopped.');
        });

        // If service is not started correctly in `startWaitDuration` ms, stop and return a fail
        if (timeoutMonitor !== null) {
          resetTimeoutCheck();
        }
        timeoutMonitor = setTimeout(() => {
          if (startStatus$.getValue() === START_FIELDS.STARTING) {
            logMessage('error', 'startup timeout reached!');
            stop();
          }
          resetTimeoutCheck();
          if (!observer.closed) {
            reportErrorCloseStream(observer, 'startup', 'error');
          }
        }, startWaitDuration);
      });
    },


    'getSettings': () => {
      return new Observable(observer => {
        const storedValues = stateRef ? JSON.parse(JSON.stringify(stateRef.store)) : {};
        const coreSettings = _coreManager.getCoreSettings('particl');

        let txUrl = '';
        const isValidTxObj = isValidObject(storedValues) && isValidObject(storedValues.urls) && isValidObject(storedValues.urls.transaction);

        if (isValidTxObj) {
          if (
            isValidObject(coreSettings) &&
            isValidObject(coreSettings.startedParams) &&
            (typeof coreSettings.startedParams.chain === 'string') &&
            (coreSettings.startedParams.chain.length > 0) &&
            (typeof storedValues.urls.transaction[coreSettings.startedParams.chain] === 'string')
          ) {
            txUrl = storedValues.urls.transaction[coreSettings.startedParams.chain];
          }
          storedValues.urls.transaction = txUrl;
        }

        observer.next(storedValues);
        observer.complete();
      });
    },


    'setSetting': (_, settingKey, newValue) => {
      return new Observable(observer => {
        let success = false;
        if (stateRef) {
          try {
            stateRef.set(settingKey, newValue);
            success = true;
          } catch (_) { }
        }
        observer.next(success);
        observer.complete();
      });
    }
  },


  on: {
    'stop': () => {
      stop();
    }
  }
};
