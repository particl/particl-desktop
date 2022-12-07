const _os             = require('os');
const _fs             = require('fs');
const _path           = require('path');
const _crypto         = require('crypto');
const _tar            = require('tar');
const { Transform }   = require('stream');
const _log            = require('electron-log');
const _fetch          = require('node-fetch');
const _sleep          = require('timers/promises').setTimeout;
const _spawn          = require('child_process').spawn;
const { Subject }     = require('rxjs');
const { auditTime }   = require('rxjs/operators');
const _cloneDeep      = require('lodash').cloneDeep;
const _electronStore  = require('electron-store');
const _zmq            = require('@zasmilingidiot/particl-zmq');
const CoreInstance    = require("../coreInstance");


const CHAIN_PROPERTIES = {
  zmqPort: {
    title: 'ZMQ Port',
    description: 'The port on which to listen for zmq updates',
    type: 'integer',
    minimum: 1025,
    maximum: 65535,
    default: 36750
  },
  zmqHost: {
    title: 'ZMQ Host IP Address',
    description: 'The ip address on which to listen for zmq updates',
    type: 'string',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    default: '127.0.0.1'
  },
  corePort: {
    title: 'Particl Core Port',
    description: 'The port number to connect to Particl Core',
    type: 'integer',
    minimum: 1025,
    maximum: 65535,
    default: 51735
  },
  coreHost: {
    title: 'Particl Core Host IP Address',
    description: 'The ip address on which to connect to Particl Core',
    type: 'string',
    pattern: '^(?:http(s)?:\\/\\/)?[\\w.-]+$',
    default: '127.0.0.1'
  },
  params: {
    title: 'Additional Startup Parameters',
    description: 'Arguments to pass to Particl Core on startup',
    type: 'array',
    items: {
      type: 'string',
      // pattern: '^\\-\\w[\\w|=]*$',
      pattern: '^-\\w[\\w|=]*$',
    },
    uniqueItems: true
  }
};

const CHAIN_REGTEST = _cloneDeep(CHAIN_PROPERTIES);
const CHAIN_TEST = _cloneDeep(CHAIN_PROPERTIES);
const CHAIN_MAIN = _cloneDeep(CHAIN_PROPERTIES);
CHAIN_REGTEST.zmqPort.default = 36850;
CHAIN_REGTEST.corePort.default = 51835;
CHAIN_TEST.zmqPort.default = 36950;
CHAIN_TEST.corePort.default = 51935;
CHAIN_MAIN.zmqPort.default = 36750;
CHAIN_TEST.corePort.default = 51735;


const SETTING_SCHEMA = Object.freeze({
  startup: {
    title: 'Launch Options',
    description: 'Configuration relating to the start-up of Particl Core',
    type: 'object',
    properties: {
      autoStart: {
        title: 'Auto Start',
        description: 'Attempt to start Particl Core automatically',
        type: 'boolean',
        default: true,
      },
      startNewInstance: {
        title: 'Start New Particl Core Instance',
        description: 'Whether to start a new core instance or not (if false, will attempt to connect to a running core instance instead)',
        type: 'boolean',
        default: true,
      },
      autoUpdate: {
        title: 'Auto Update',
        description: 'Attempt to automatically download a Particl Core version if it is invalid or missing',
        type: 'boolean',
        default: true,
      },
      url: {
        title: 'URL',
        description: 'The URL to query for new Particl Core versions',
        type: 'string',
        pattern: "^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
        default: `https://raw.githubusercontent.com/particl/particl-desktop/dev/modules/clientBinaries/clientBinaries.json`
      },
      downloadTimeout: {
        title: 'Download Timeout (seconds)',
        description: 'The number of seconds to allocate to the download of a new Particl Core version before the download is considered to have timed out',
        type: 'integer',
        minimum: 20,
        maximum: 3600,
        default: 600
      },
    },
    required: [ 'autoStart', 'startNewInstance', 'autoUpdate', 'url', 'downloadTimeout' ],
    default: {}
  },

  datadir: {
    title: 'Data Directory Location',
    description: 'Which folder Particl Core should use for data (only applies when starting a new Particl Core instance)',
    type: 'string',
  },

  proxy: {
    title: 'Proxy Connection Details',
    description: 'Proxy connection details',
    type: 'object',
    properties: {
      enabled: {
        title: 'Enabled',
        description: 'Whether Particl Core should connect via a proxy or not (not applicable when connecting to an already running Particl Core instance)',
        type: 'boolean',
        default: false,
      },
      url: {
        title: 'Proxy URL',
        description: 'The proxy URL through which Particl Core will connect',
        type: 'string',
        pattern: "^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
        default: 'http://127.0.0.1:9050'
      },
    },
    required: [ 'enabled', 'url' ],
    default: {}
  },

  authentication: {
    title: 'Particl Core RPC Authentication',
    description: 'Authentication details that Particl Core should use when starting a new instance (or the client should use when connecting to an already running node)',
    type: 'object',
    properties: {
      useCookie: {
        title: 'Use Cookie',
        description: 'Use Particl Core generated cookie file for authentication (only applies when either starting a new Particl Core instance or connecting to a particl-core instance running on the local machine where a data directory has been provided)',
        type: 'boolean',
        default: true
      },
      rpcUser: {
        title: 'RPC User',
        description: 'The authentication username',
        type: 'string',
        default: ''
      },
      rpcPass: {
        title: 'RPC Password',
        description: 'The authentication password value',
        type: 'string',
        default: ''
      },
    },
    required: [ 'useCookie', 'rpcUser', 'rpcPass' ],
    default: {}
  },

  network: {
    title: 'Particl Core Network',
    description: 'The network to start particl core on',
    type: 'object',
    properties: {
      mainnet: {
        type: 'boolean',
        default: true,
      },
      testnet: {
        type: 'boolean',
        default: false,
      },
      regtest: {
        type: 'boolean',
        default: false,
      },
    },
    required: [ 'mainnet', 'testnet', 'regtest' ],
    default: {}
  },

  regtest: {
    title: 'Regtest Network Configuration',
    description: "Settings for starting or connecting to a regtest network node",
    type: "object",
    properties: CHAIN_REGTEST,
    required: [ 'zmqPort', 'zmqHost', 'corePort', 'coreHost' ],

    default: {}
  },

  testnet: {
    title: 'Test Network Configuration',
    description: "Settings for starting or connecting to a test network node",
    type: "object",
    properties: CHAIN_TEST,
    required: [ 'zmqPort', 'zmqHost', 'corePort', 'coreHost' ],

    default: {}
  },

  mainnet: {
    title: 'Main Network Configuration',
    description: "Settings for starting or connecting to a main network (ie: real money) node",
    type: "object",
    properties: CHAIN_MAIN,
    required: [ 'zmqPort', 'zmqHost', 'corePort', 'coreHost' ],
    default: {}
  },

  verification: {
    title: 'Particl Core verifications',
    description: '',
    type: 'object',
    properties: {
      binaryName: {
        title: 'Particl Core Binary Name',
        description: '',
        type: 'string',
        default: 'particld'
      },
      versionArg: {
        title: 'Binary version check arg',
        description: 'The arg to pass to the binary to check for the appropriate version',
        type: 'string',
        default: '-version'
      },
      outputVersionPrefix: {
        title: 'Version Check Output Prefix',
        description: 'The string preceding the version number in the output',
        type: 'string',
        default: 'Particl Core version'
      },
    },
    required: [ 'binaryName', 'versionArg', 'outputVersionPrefix' ],
    default: {}
  }
});


const STARTED_STATUS = {
  STOPPED: 0,
  STARTED: 1,
  STARTING: 2,
  STOPPING: 3,
};


module.exports = class ParticlCore extends CoreInstance {

  // reference to the underlying/backing settings storage
  #settingsRef;
  // the current settings valued as populated from the settings storage (saves having to read the storage each time)
  #settingsValues;
  // details related to the current connected core instance
  #startedParams = {
    started: STARTED_STATUS.STOPPED,
    hasError: false,
    message: '',
    url: '',
    auth: '',
    zmq: { },
    version: '',
    chain: ''
  };

  // temporary params to pass to particl-core on its next execution
  #tempRestartParams = [];

  // enables aborting in progress startup activities
  #abortController = new AbortController();
  // quick reference to the AbortController signal (for convenience)
  #cancelSignal = this.#abortController.signal;

  // The current application version
  #appVersion;

  // Path to where the core binaries should go
  #binaryPath;

  #isDevelopmentEnvironment = false;
  #forceTestnet = false;

  // holds a reference to the spawned pacticl core process (if one is spawned)
  #startedDaemon = undefined;

  // holds a reference to the zmq socket connection if one is created
  #zmqSocket = undefined;

  #ZMQ_SUBJECTS = {};


  constructor(appConfig) {
    super();

    this.#settingsRef = new _electronStore({
      schema: SETTING_SCHEMA,
      // migrations: migrations,
      name: 'particl-core',
      cwd: appConfig.PATHS.config,
      fileExtension: 'json',
      clearInvalidConfig: false,
      accessPropertiesByDotNotation: true,
    });

    this.#settingsValues = this.#settingsRef.store;

    this.#appVersion = appConfig.VERSIONS.app;
    this.#binaryPath = _path.join(appConfig.PATHS.binaries, 'particl');
    this.#forceTestnet = appConfig.TESTING_MODE === true;
    this.#isDevelopmentEnvironment = appConfig.MODE === 'developer';
  }


  getSettings() {
    return { schema: SETTING_SCHEMA, values: this.#settingsValues, startedParams: this.#startedParams };
  }


  updateSettings(settingsType, newSettings) {
    // TODO: some validation here would probably be necessary, maybe instead return some sort of error on failed update
    try {
      this.#settingsRef.set(newSettings);
      this.#settingsValues = this.#settingsRef.store;
    } catch(err) {
      _log.err(`Particl Update Settings failed: `, err.message);
      return false;
    }

    return true;
  }


  listListeners() {
    return ['status', 'zmq'];
  }


  async initialize() {
    this.#updateStatus({});
    if (this.#settingsValues.startup.autoStart) {
      await this.#startSystem();
    }
  }


  async start() {
    await this.#startSystem();
  }


  async stop(doRestart = false) {
    if (!this.#cancelSignal.aborted) {
      this.#abortController.abort();
    }

    // no need to continue if already stopping or stopped
    if ((this.#startedParams.started === STARTED_STATUS.STOPPED) || (this.#startedParams.started === STARTED_STATUS.STOPPING)) return;

    this.#updateStatus({hasError: false, started: STARTED_STATUS.STOPPING, message: 'Stopping Particl Core'});

    let success = false;

    if (this.#zmqSocket) {
      this.#updateStatus({message: 'Attempting to disconnect and stop ZMQ socket...'});
      await this.#zmqSocket.disconnect()
        .then(() => {
          this.#updateStatus({message: 'Successfully disconnected ZMQ socket', zmq: {} });
          this.#zmqSocket = undefined;
          this.#teardownZmqDataSubjects();
        })
        .catch(err =>
          this.#updateStatus({message: `ZMQ socket disconnect error: ${err && err.message ? err.message : err}`})
        );
    }

    if (this.#startedDaemon) {

      // request core to stop, giving it 30 seconds to do so.
      const isStopped = await Promise.race([
        new Promise((resolve, reject) => {
          this.#startedDaemon.once('close', code => {
            this.#updateStatus({message: `Particl Core exited with code ${code}`});
            resolve();
          });

          this.#updateStatus({message: 'Using rpc to request Particl Core to stop'});

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.#startedParams.auth}`,
            'Accept': 'application/json',
          };

          _fetch(
            `${this.#getRpcUrl()}`,
            { method: 'POST', headers, redirect: 'follow', body: JSON.stringify({'jsonrpc': '1.0', method: 'stop', params: [], id: 'particl-desktop'}), timeout: 5_000}
          ).then(res =>
            res.json()
          ).then(res => {
            if (!res || res.id !== 'particl-desktop' || res.error !== null ) {
              reject();
            }
          }).catch(() => reject());
        }).then(() => true).catch(() => false),

        // If particld has not shutdown after this many seconds, kill the process...
        _sleep(60_000, false)
      ]);

      if (!isStopped) {
        this.#updateStatus({message: 'Particl Core failed to stop via rpc - killing it brutally :('});

        try {
          this.#startedDaemon.kill('SIGINT');
          success = true;
        } catch (error) {
          this.#updateStatus({message: 'Failed to kill Particl Core'});
        }
      } else {
        success = true;
      }
    } else {
      this.#updateStatus({message: 'Particl Core is unmanaged'});
      success = true;
    }


    if (success) {
      this.#startedDaemon = undefined;

      this.#updateStatus({
        started: STARTED_STATUS.STOPPED,
        message: 'Particl Core stopped successfully',
        hasError: false,
        url: '',
        auth: '',
        zmq: { },
        version: '',
        chain: '',
      });

      if (doRestart) {
        setTimeout(this.start, 0);
      }
    } else {
      this.#updateStatus({message: 'Particl Core errored during stop request!', hasError: true});
    }
  }


  #updateStatus(data) {
    for (const key of Object.keys(data)) {
      if (key in this.#startedParams) {
        this.#startedParams[key] = data[key];
      }
    }
    if (data.message) {
      _log.info(data.message);
    }
    this.emit('status', this.#startedParams);
  }


  async #startSystem() {
    if (this.#startedParams.started !== STARTED_STATUS.STOPPED) return;

    this.#updateStatus({hasError: false, started: STARTED_STATUS.STARTING});

    if (this.#cancelSignal.aborted) {
      this.#abortController = new AbortController();
      this.#cancelSignal = this.#abortController.signal;
    };

    if (this.#settingsValues.startup.startNewInstance) {
      // A. Launch new core instance

      // 1. fetch the correct binary config details (hash, version, etc)
      this.#updateStatus({message: 'Retrieving Particl Core binary details'});
      const cfg = await this.#processBinaryConfig();

      if (this.#cancelSignal.aborted) return;
      if (!(cfg.hash && cfg.version)) {
        this.#updateStatus({
          message: 'Failed to retrieve Particl Core binary details!',
          hasError: true,
          started: STARTED_STATUS.STOPPED
        });
        return;
      }

      // 2. Search for and start core
      const isStarted = await this.#startCoreBinary(cfg.version, cfg.hash, cfg.downloadUrl);

      if (this.#cancelSignal.aborted) return;

      if (!isStarted) {
        this.#updateStatus({
          message: 'Failed to start Particl Core!',
          hasError: true,
          started: STARTED_STATUS.STOPPED
        });
        return;
      }

      const rpcUrl = this.#getRpcUrl();
      const rpcAuth = await this.#getRpcAuth();
      const connected = await this.#testRpcConnection(rpcUrl, rpcAuth);
      const zmqStatus = await this.#getZmqAvailability(rpcUrl, rpcAuth);

      if (this.#cancelSignal.aborted) return;

      if (!connected) {
        this.#updateStatus({
          message: 'Failed to connect to Particl Core instance',
          hasError: true,
        });
        return;
      }

      this.#updateStatus({
        started: STARTED_STATUS.STARTED,
        message: 'Particl Core started and connected',
        url: rpcUrl,
        auth: rpcAuth,
        zmq: zmqStatus,
        version: cfg.version,
      });

    } else {
      // B. Connect to existing core instance
      this.#updateStatus({message: 'Attempting to connect to an existing Particl Core instance...'});

      const rpcUrl = this.#getRpcUrl();
      const rpcAuth = await this.#getRpcAuth();
      const connected = await this.#testRpcConnection(rpcUrl, rpcAuth);

      if (this.#cancelSignal.aborted) return;

      if (!connected) {
        this.#updateStatus({
          message: 'Failed to connect to Particl Core instance',
          hasError: true,
          started: STARTED_STATUS.STOPPED
        });
        return;
      }

      this.#updateStatus({message: 'Core connection successfully established'});
      const zmqStatus = await this.#getZmqAvailability(rpcUrl, rpcAuth);

      if (this.#cancelSignal.aborted) return;

      this.#updateStatus({
        started: STARTED_STATUS.STARTED,
        url: rpcUrl,
        auth: rpcAuth,
        message: 'Particl Core connected',
        zmq: zmqStatus
      });
    }

    if (this.#cancelSignal.aborted) return;

    // 3. Set up zmq notifications if available
    if (!(
      (this.#startedParams.started === STARTED_STATUS.STARTED) &&
      (Object.keys(this.#startedParams.zmq).length > 0) &&
      (this.#zmqSocket === undefined)
    )) {
      return;
    }

    try {
      this.#zmqSocket = new _zmq(
        this.#startedParams.zmq,
        { maxRetry: 100 }
      );

      this.#zmqSocket.connect();

      const zmqKeys = Object.keys(this.#startedParams.zmq);

      this.#setupZmqDataSubjects(zmqKeys);

      for (const service of zmqKeys) {

        this.#zmqSocket.on(service, (data) => {
          this.#ZMQ_SUBJECTS[service].next(data);
        });
      }

      this.#zmqSocket.on('connect:*', (uri, type) => {
        this.emit('zmq', {status: 'connected', channel: type, data: undefined});
      });

      this.#zmqSocket.on('close:*', (err, type) => {
        this.emit('zmq', {status: 'closed', channel: type, data: undefined});
      });

      this.#zmqSocket.on('retry:*', (type, attempt) => {
        this.emit('zmq', {status: 'retry', channel: type, data: attempt});
      });

      this.#zmqSocket.on('error:*', (err, type) => {
        this.emit('zmq', {status: 'error', channel: type, data: undefined});
      });
    } catch (_) { }

    return;
  }


  #createBinariesDir() {
    // Test for existence of the containing binaries dir
    let pathExists = false;
    try {
      _fs.accessSync(this.#binaryPath, _fs.constants.W_OK | _fs.constants.R_OK );
      pathExists = true;
    } catch (err) {

      try {
        if (!_fs.existsSync(this.#binaryPath)) {
          _fs.mkdirSync(this.#binaryPath, {recursive: true});
          pathExists = true;
        }
      } catch(_) { /* nothing much to do here */}
    }
    return pathExists;
  }


  async #processBinaryConfig() {

    const writeBinaryConfig = (config) => {

      const pathExists = this.#createBinariesDir();
      if (!pathExists) {
        return false;
      }

      try {
        _fs.writeFileSync(this.#binaryPath, JSON.stringify(config, null, 2), {encoding: 'utf8'});
        return true;
      } catch (_) { }

      return false;
    }

    const extractBinaryConfigDetails = (config = {}) => {
      const response = {hash: '', version: '', downloadUrl: ''};
      let os = process.platform;
      switch (process.platform) {
        case 'win32': os = 'win'; break;
        case 'darwin': os = 'osx'; break;
      }

      const arch = process.arch;

      let semVer = this.#appVersion.match(/\d+\.\d+.\d+/);
      if (Array.isArray(semVer) && semVer.length > 0 ) {
        semVer = semVer[0];

        for (const ver of [semVer, semVer.match(/\d+\.\d+/)[0], semVer.match(/\d+/)[0]]) {
          try {
            const coreVersion = config[ver].version;
            const extractedData = config[ver].platforms[os][arch];
            const hash = extractedData.sha256;
            const downloadUrl = typeof extractedData.url === 'string' ? extractedData.url : response.downloadUrl;

            if (typeof hash === 'string' && typeof coreVersion === 'string') {
              response.hash = hash;
              response.version = coreVersion;
              response.downloadUrl = downloadUrl;
              break;
            }
          } catch (_) { /* try next option */ }
        }
      }

      return response;
    }

    const binaryInfo = { hash: '', version: '', downloadUrl: '' };

    if (this.#cancelSignal.aborted) return binaryInfo;

    this.#updateStatus({message: 'Attempting to read in local core configuration...'});

    try {
      const localConfig = JSON.parse(_fs.readFileSync(_path.join(this.settingsPath, 'clientBinaries.json'), {encoding: 'utf8'}));
      const localInfo = extractBinaryConfigDetails(localConfig);
      if (localInfo.version.length > 0) {
        binaryInfo.version = localInfo.version;
        binaryInfo.hash = localInfo.hash;
        binaryInfo.downloadUrl = localInfo.downloadUrl;
      }
    } catch(_) {
      this.#updateStatus({message: 'Failed to extract local core configuration!'});
    }

    if (this.#cancelSignal.aborted) return binaryInfo;

    if (binaryInfo.version.length === 0 || binaryInfo.hash.length === 0) {
      this.#updateStatus({message: 'Attempting to read in default core configuration...'});
      try {
        let defaultConfig = require('./clientBinaries.json');
        if (typeof defaultConfig === 'string') {
          defaultConfig = JSON.parse(defaultConfig);
        }
        const defaultInfo = extractBinaryConfigDetails(defaultConfig);
        if (defaultInfo.version.length > 0) {
          binaryInfo.version = defaultInfo.version;
          binaryInfo.hash = defaultInfo.hash;
          binaryInfo.downloadUrl = defaultInfo.downloadUrl;
        }
      } catch(_) {
        this.#updateStatus({message: 'Failed to extract default core configuration!'});
       }
    }



    if (!this.#cancelSignal.aborted && this.#settingsValues.startup.autoUpdate) {

      this.#updateStatus({message: 'Checking remote core configuration...'});
      let isValidUrl = false;

      try {
        new URL(this.#settingsValues.startup.url);
        isValidUrl = true;
      } catch (_) {
        this.#updateStatus({message: 'Invalid remote URL found!'});
      }

      if (isValidUrl && !this.#cancelSignal.aborted) {
        const remoteConfig = await _fetch(
          this.#settingsValues.startup.url,
          { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', signal: this.#cancelSignal }
        )
        .then(response => response.json())
        .catch(() => {
          this.#updateStatus({message: 'Failed retrieving the remote binary config!'});
          return {};
        });

        if (!this.#cancelSignal.aborted && Object.keys(remoteConfig).length > 0 ) {
          const remoteInfo = extractBinaryConfigDetails(remoteConfig);
          if (remoteInfo.hash.length > 0 && (remoteInfo.version !== binaryInfo.version) && !this.#cancelSignal.aborted) {
            const success = writeBinaryConfig(remoteConfig);
            if (!success) {
              this.#updateStatus({message: 'Failed saving the updated binary config data!'});
            }
            binaryInfo.version = remoteInfo.version;
            binaryInfo.hash = remoteInfo.hash;
            binaryInfo.downloadUrl = remoteInfo.downloadUrl;
          }
        }
      }
    }

    return binaryInfo;
  }


  async #startCoreBinary(version, hash, downloadUrl) {

    if (this.#cancelSignal.aborted) return false;

    // Ensure that the binaries Dir housing everything actually exists and is writeable, etc
    const pathExists = this.#createBinariesDir();
    if (!pathExists) {
      this.#updateStatus({message: `Invalid particl-core binaries folder at ${this.#binaryPath} !`});
      return false;
    }

    const binName = this.#settingsValues.verification.binaryName + (process.platform.includes('win') ? '.exe' : '');
    const binPath = _path.join(this.#binaryPath, binName);

    if (this.#cancelSignal.aborted) return false;

    this.#updateStatus({message: `Checking for particl-core binary existence...`});

    let hasBinary = false;
    try {
      _fs.accessSync(binPath, _fs.constants.F_OK | _fs.constants.X_OK);
      hasBinary = true;
    } catch(_) { /* ... */ }

    if (this.#cancelSignal.aborted) return false;

    if (hasBinary) {
      this.#updateStatus({message: `Verifying found binary file version`});
      const isvalid = await this.#validateBinary(binPath, version).catch(() => false);

      if (this.#cancelSignal.aborted) return false;

      if (!isvalid) {
        hasBinary = false;
        this.#updateStatus({message: `Verification of found binary failed!`});
      }
    }

    if (!hasBinary) {

      // check for previously downloaded archive locally

      if (this.#cancelSignal.aborted) return false;
      if (!downloadUrl) return false;

      this.#updateStatus({message: `Searching for previously downloaded binary archives...`});

      let foundBinPackage = false;
      const packagenameparts = downloadUrl.split('/');
      const packagename = packagenameparts[packagenameparts.length - 1];
      const packagepath = _path.join(this.#binaryPath, packagename);

      if ((typeof packagename == 'string') && (packagename.endsWith('.zip') || packagename.endsWith('.tar.gz'))) {
        try {
          _fs.accessSync(packagepath, _fs.constants.F_OK | _fs.constants.R_OK);
          foundBinPackage = true;
        } catch(_) { /* ... */ }
      }

      if (foundBinPackage) {
        // archive is already on the machine... verify its checksum
        if (this.#cancelSignal.aborted) return false;

        this.#updateStatus({message: `Validating local found archive ${packagepath}...`});
        const foundHash = await runChecksum(packagepath, 'sha256').catch(() => '');

        if (this.#cancelSignal.aborted) return false;

        if (!foundHash || (hash !== foundHash)) {
          this.#updateStatus({message: `Checksum failed for ${packagepath}!`});
          foundBinPackage = false;
        }
      }

      if (!foundBinPackage) {
        // archive is not available locally or is available but invalid... try to download it if possible
        if (this.#settingsValues.startup.autoUpdate) {
          // attempt to download the archive
          this.#updateStatus({message: `Attempting download of particl-core archive from ${downloadUrl}`});
          const tempPackagePath = _path.join(this.#binaryPath, 'temp_' + packagename);
          const success = await this.#downloadBinaryPackage(downloadUrl, tempPackagePath)
            .then(() => true)
            .catch(err => {
              this.#updateStatus({message: `Download failed: ${err}`});
              return false;
            });

          if (this.#cancelSignal.aborted) return false;
          if (success) {
            try {
              // rename downloaded 'temp' file
              _fs.renameSync(tempPackagePath, packagepath);
              // now verify the downloaded archive
              this.#updateStatus({message: `Validating downloaded archive ${packagepath}...`});
              const foundHash = await runChecksum(packagepath, 'sha256').catch(() => '');

              if (!foundHash || (hash !== foundHash)) {
                if (this.#cancelSignal.aborted) return false;
                this.#updateStatus({message: `Checksum failed for downloaded archive ${packagepath}!`});
              } else {
                foundBinPackage = true;
              }
            } catch (_) {
              this.#updateStatus({message: `Failed renaming downloaded archive!`});
            }
          }
        }
      }

      if (foundBinPackage) {
        if (this.#cancelSignal.aborted) return false;

        // found a valid archive... try to extract the correct binary file
        this.#updateStatus({message: `Extracting particl-core binary "${binName}" from ${packagepath}`});
        switch (true) {
          case packagename.endsWith('.zip'):
            const AdmZip = require("adm-zip");
            try {
              const zip = new AdmZip(packagepath);
              let foundZippedEntryPath;

              for (const zipEntry of zip.getEntries()) {
                if (this.#cancelSignal.aborted) break;

                if ((zipEntry.name === binName) && !zipEntry.isDirectory) {
                  foundZippedEntryPath = zipEntry.entryName;
                  break;
                }
              }

              if (foundZippedEntryPath && !this.#cancelSignal.aborted) {
                zip.extractEntryTo(foundZippedEntryPath, this.#binaryPath, false, true, false, binName);
                hasBinary = true;
              }
            } catch (e) {
              this.#updateStatus({message: `Error reading zip archive ${packagepath} : ${e && e.message ? e.message : e}`});
            }
          break;

          case packagename.endsWith('.tar.gz'):
            const fileList = [];
            await _tar.t({
              cwd: this.#binaryPath,
              file: packagepath,
              filter: (path, entry) => {
                if (entry.type === 'File') {
                  const parts = path.split('/');
                  return parts[parts.length -1] === 'particld';
                }
                return false;
              },
              onentry: (entry) => fileList.push(entry.path)
            }).catch(() => null);

            if (fileList.length > 0) {
              const fileToExtract = fileList[0];
              const stripCount = fileToExtract.split('/').length - 1;
              await _tar.x(
                {
                  cwd: this.#binaryPath,
                  file: packagepath,
                  strip: stripCount >= 0 ? stripCount : 0
                },
                [fileList[0]]
              )
              .then(() => hasBinary = true)
              .catch(e => this.#updateStatus({message: `Error reading archive ${packagepath} : ${e && e.message ? e.message : e}`}));
            }
          break;
        }

        if (this.#cancelSignal.aborted) return false;

        if (hasBinary) {
          // extraction from archive was successful so ensure binary is the correct version
          this.#updateStatus({message: `Verifying extracted binary file version...`});
          hasBinary = await this.#validateBinary(binPath, version).catch(() => false);
          if (!hasBinary) {
            this.#updateStatus({message: `Verification of extracted binary file failed!`});
          }
        }
      }
    }

    if (this.#cancelSignal.aborted || !hasBinary) return false;

    this.#updateStatus({message: `Collecting args to start binary with...`});
    const deamonArgs = [
      '-server=1',
      '-txindex',
      '-addressindex',
    ];

    if (this.#settingsValues.datadir) {
      deamonArgs.push(`-datadir=${this.#settingsValues.datadir}`);
    }

    if (this.#settingsValues.proxy.enabled) {
      deamonArgs.push(`-proxy=${this.#settingsValues.proxy.url}`);
    }

    let netSettings = this.#settingsValues.mainnet;

    if (this.#settingsValues.network.testnet || this.#forceTestnet) {
      netSettings = this.#settingsValues.testnet;
      deamonArgs.push('-testnet');
    }

    if (this.#settingsValues.network.regtest) {
      netSettings = this.#settingsValues.regtest;
      deamonArgs.push('-regtest');
    }

    if ((netSettings.coreHost !== 'localhost') && !netSettings.coreHost.startsWith('127.0.0.1')) {
      deamonArgs.push(`-rpcbind=${netSettings.coreHost}`);
      deamonArgs.push(`-rpcallowip=${netSettings.coreHost}`);
    }
    deamonArgs.push(`-rpcport=${netSettings.corePort}`);
    for (const zmqService of ['hashblock', 'smsg', 'hashtx']) {
      deamonArgs.push(`-zmqpub${zmqService}=tcp://${netSettings.zmqHost}:${netSettings.zmqPort}`);
    }

    if (!this.#settingsValues.authentication.useCookie) {
      deamonArgs.push(`-rpcuser=${this.#settingsValues.authentication.rpcUser}`);
      deamonArgs.push(`-rpcpassword=${this.#settingsValues.authentication.rpcPass}`);
    }

    if (Array.isArray(netSettings.params) && netSettings.params.length > 0) {
      deamonArgs.push(...netSettings.params);
    }

    if (this.#tempRestartParams.length > 0) {
      deamonArgs.push(...this.#tempRestartParams);
      this.#tempRestartParams = [];
    }

    if (this.#isDevelopmentEnvironment) {
      deamonArgs.push(`-rpccorsdomain=http://localhost:4200`);
    }

    this.#updateStatus({message: `Starting particl-core with args: ${deamonArgs.join(' ')}`});

    if (this.#cancelSignal.aborted) return false;

    const childProc = _spawn(binPath, deamonArgs);

    // TODO: maybe this is not necessary
    childProc.stdout.on('data', data => {
      console.log(data.toString().trim());
    });

    childProc.stderr.on('data', data => {
      const err = data.toString('utf8');
      console.log(data.toString().trim());
      if (err.includes("-reindex")) {
        this.#tempRestartParams.push('-reindex');
        this.stop(true);
        return;
      }
      // this.stop();

    });

    this.#startedDaemon = childProc;

    return true;
  }


  #validateBinary(filePath, version) {
    return new Promise((resolve, reject) => {

      if (this.#cancelSignal.aborted) reject();

      const cmd = _spawn(filePath, [this.#settingsValues.verification.versionArg], { signal: this.#cancelSignal });

      let output = '';
      cmd.stdout.on('data', (d) => {
        output += d;
      });

      cmd.on('close', () => {
        let isCorrectVersion = false;

        if (this.#settingsValues.verification.outputVersionPrefix) {
          const matchedLines = output.match(new RegExp(`^.*${this.#settingsValues.verification.outputVersionPrefix}.*$`, 'gm'));
          if (Array.isArray(matchedLines) && matchedLines.length > 0) {

            const versionRegex = new RegExp(`.*${version}.*`);

            for (const line of matchedLines) {
              const match = line.match(versionRegex);
              if (Array.isArray(match) && match.length > 0) {
                isCorrectVersion = true;
                break;
              }
            }
          }
        } else {
          const versionRegex = new RegExp(`^.*${version}.*$`, 'gm');
          const matches = output.match(versionRegex);
          if (Array.isArray(matches) && matches.length > 0) {
            isCorrectVersion = true;
          }
        }

        resolve(isCorrectVersion);
      });
    });
  }


  #downloadBinaryPackage(downloadURL, targetDestinationPath, currentRedirect = 0) {
    return new Promise((resolve, reject) => {

      if (currentRedirect > 3) {
        reject('max download redirects reached');
      }

      if (this.#cancelSignal.aborted) {
        reject('download cancelled');
      }

      const _http = downloadURL.startsWith('https') ? require('https') : require('http');

      const req = _http.get(downloadURL, {signal: this.#cancelSignal});

      req.on('response', (res) => {

        try {

          if ((res.statusCode >= 200) && (res.statusCode < 300)) {

              const totalContentBytes = +res.headers["content-length"];
              let downloadedBytes = 0;
              let downloadProgress = 0;

              const file = _fs.createWriteStream(targetDestinationPath, {flags: 'w'});

              const transformStream = new Transform();
              transformStream._transform = (chunk, encoding, callback) => {
                transformStream.push(chunk, encoding);
                downloadedBytes += chunk.length;
                if (totalContentBytes > 0) {
                  const actualProgress = Math.floor(downloadedBytes / totalContentBytes * 100);
                  if (actualProgress != downloadProgress) {
                    downloadProgress = actualProgress;
                    this.#updateStatus({message: `Download progress: ${downloadProgress}%`});
                  }
                }
                callback();
              }

              res.on('end', () => {
                file.end();
                this.#updateStatus({message: `Download complete`});
                resolve();
              });
              res.on('error', (e) => {
                file.end();
                try {
                  // attempt to remove the temporary file
                  _fs.unlinkSync(targetDestinationPath);
                } catch(_) { }
                reject(`${e && e.message ? e.message : e}`);
              });

              res.pipe(transformStream).pipe(file);


              file.on(`error`, _ => {
                this.#updateStatus({message: `Saving the downloaded file failed!`});
              });

            } else if ((res.statusCode === 301) || (res.statusCode === 302)) {
              // follow the redirect
              this.#downloadBinaryPackage(res.headers.location, targetDestinationPath, currentRedirect + 1).then(() => resolve());
            } else {
              reject(`${downloadURL} is currently unavailable or not responding!`);
            }
          } catch (_) {
            reject(`An unexpected error occurred during download!`);
          }
        });
        req.on('error', (err) => {
          // handle error
          this.#updateStatus({message: `The download errored: ${err && err.message ? err.message : err}`});
        });

        req.setTimeout(this.#settingsValues.startup.downloadTimeout * 1_000, () => {
          request.abort();
          reject('Downloading of Particl Core binaries exceeded timeout');
        });
    });
  }


  async #getRpcAuth() {
    let rpcAuth = '';

    if (!this.#settingsValues.authentication.useCookie) {
      rpcAuth = `${this.#settingsValues.authentication.rpcUser}:${this.#settingsValues.authentication.rpcPass}`;
    } else {
      let defaultDataDir = this.#settingsValues.datadir;

      if (!defaultDataDir) {
        const appName = 'Particl';

        switch (process.platform) {
          case 'linux': {
            const homeDir = _os.homedir ? _os.homedir() : process.env['HOME'];
            defaultDataDir = _path.join(homeDir, '.' + appName.toLowerCase());
            break;
          }

          case 'darwin': {
            const homeDir = _os.homedir ? _os.homedir() : process.env['HOME'];
            defaultDataDir = _path.join(homeDir, 'Library', 'Application Support', appName);
            break;
          }

          case 'win32': {
            defaultDataDir = _path.join(process.env['APPDATA'], appName);
            break;
          }
        }
      }

      const attempts = this.#startedDaemon ? 10 : 1;

      for (let ii = 0; ii < attempts; ii++) {

        if (this.#cancelSignal.aborted) return rpcAuth;

        if (attempts > 1) {
          try {
            await _sleep(1_000, true, {signal: this.#cancelSignal});
          } catch(_) {
            break;
          }
        }

        try {
          if (_fs.existsSync(defaultDataDir) && _fs.statSync(defaultDataDir).isDirectory()) {
            const segments = [defaultDataDir];
            if (this.#settingsValues.network.testnet || this.#forceTestnet) {
              segments.push('testnet');
            } else if (this.#settingsValues.network.regtest) {
              segments.push('regtest');
            }
            segments.push('.cookie');
            const cookiePath = _path.join(...segments);

            if (_fs.existsSync(cookiePath) && _fs.statSync(cookiePath).isFile()) {
              rpcAuth = _fs.readFileSync(cookiePath, {encoding: 'utf8'}).trim();

              if (rpcAuth) {
                break;
              }
            }
          }
        } catch(err) {
          if (!(err && err.code === 'ENOENT')) {
            // something other than the file not existing has gone wrong, so abort
            break;
          }
        }
      }
    }

    return Buffer.from(rpcAuth).toString('base64');
  }


  async #testRpcConnection(rpcUrl, rpcAuth) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${rpcAuth}`,
      'Accept': 'application/json',
    };

    let success = false;
    const maxCalls = 10;

    for (let ii = 1; ii <= maxCalls; ii++) {
      if (this.#cancelSignal.aborted) break;

      this.#updateStatus({message: `Attempt ${ii} to connect to ${rpcUrl}`});

      try {

        const response = await _fetch(
          `${rpcUrl}`,
          { method: 'POST', headers, redirect: 'follow', body: JSON.stringify({'jsonrpc': '1.0', method: 'getblockchaininfo', params: [], id: 'particl-desktop'}), timeout: 5_000, signal: this.#cancelSignal}
        ).then(res => res.json());

        if (response && response.result) {
          success = true;
          if (typeof response.result.chain === 'string') {
            this.#updateStatus({chain: response.result.chain});
          }
        }
      } catch (_) { }

      if (success) {
        break;
      }

      // wait some time between failed calls
      if (ii < (maxCalls)) {
        try {
          await _sleep(1_500 * ii, true, {signal: this.#cancelSignal});
        } catch(_) { }
      }
    }

    return success;
  }


  async #getZmqAvailability(rpcUrl, rpcAuth) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${rpcAuth}`,
      'Accept': 'application/json',
    };

    const result = { };

    if (this.#cancelSignal.aborted) return result;

    this.#updateStatus({message: `Checking ZMQ connectivity...`});

    await _fetch(
      `${rpcUrl}`,
      { method: 'POST', headers, redirect: 'follow', body: JSON.stringify({'jsonrpc': '1.0', method: 'getzmqnotifications', params: [], id: 'particl-desktop'}), timeout: 5_000, signal: this.#cancelSignal}

    )
    .then(resp => resp.json())
    .then((resp) => {
      if (resp && typeof resp === 'object' && Array.isArray(resp.result)) {
        resp.result.forEach(resObj => {
          if (typeof resObj === 'object' && resObj && typeof resObj.type === 'string' && typeof resObj.address == 'string') {
            let serviceKey = resObj.type;
            if (serviceKey.startsWith('pub')) {
              serviceKey = serviceKey.replace('pub', '');
            }
            if (serviceKey) result[serviceKey] = resObj.address;
          }
        });
      }
    })
    .catch(() => {
      // nothing to do
    });

    this.#updateStatus({message: `ZMQ availability check completed, service count: ${Object.keys(result).length}`});
    return result;
  }


  #getRpcUrl() {
    return this.#settingsValues.network.testnet || this.#forceTestnet ?
      `http://${this.#settingsValues.testnet.coreHost}:${this.#settingsValues.testnet.corePort}` : (
        this.#settingsValues.network.regtest
        ? `http://${this.#settingsValues.regtest.coreHost}:${this.#settingsValues.regtest.corePort}`
        : `http://${this.#settingsValues.mainnet.coreHost}:${this.#settingsValues.mainnet.corePort}`
      );
  }


  #setupZmqDataSubjects(zmqChannels) {
    this.#teardownZmqDataSubjects();

    zmqChannels.forEach(channel => {
      this.#ZMQ_SUBJECTS[channel] = new Subject();
      this.#ZMQ_SUBJECTS[channel].pipe(
        auditTime(2_000)
      ).subscribe({
        next: (data) => {
          this.emit('zmq', {status: 'data', channel: channel, data: data.toString('hex')});
        }
      });
    });
  }


  #teardownZmqDataSubjects() {
    Object.keys(this.#ZMQ_SUBJECTS).forEach(channel => {
      try {
        this.#ZMQ_SUBJECTS[channel].complete();
      } catch (_) { }
    });
    this.#ZMQ_SUBJECTS = {};
  }
}


function runChecksum(filePath, algorithm) {
  return new Promise((resolve, reject) => {
    const checksum = _crypto.createHash(algorithm);

    const stream = _fs.ReadStream(filePath);

    stream.on('data', (d) => checksum.update(d));

    stream.on('end', () => {
      resolve(checksum.digest('hex'));
    });

    stream.on('error', reject);
  });
}
