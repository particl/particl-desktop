const _electronStore  = require('electron-store');
const CoreInstance = require("../coreInstance");


const SETTING_SCHEMA = Object.freeze({
  startup: {
    title: 'Launch Options',
    description: 'Configuration relating to the start-up of Particl Core',
    type: 'object',
    properties: {
      autoStart: {
        title: 'Auto Start',
        description: 'Attempt to start Particl Core daemon on application start',
        type: 'boolean',
        default: false,
      },
      startNewInstance: {
        title: 'Start New Particl Core Instance',
        description: 'Whether to start a new core instance or not (if false, will attempt to connect to a running core instance instead)',
        type: 'boolean',
        default: false,
      },
      downloadIfInvalid: {
        title: 'Download If Invalid',
        description: 'Attempt to automatically download a Particl Core version if it invalid or missing',
        type: 'boolean',
        default: true,
      },
    },
    required: [ 'autoStart', 'startNewInstance', 'downloadIfInvalid' ],
    default: {}
  },

  updates: {
    title: 'Update Options',
    description: 'Settings related to checking for new Particl Core versions',
    type: 'object',
    properties: {
      checkForUpdates: {
        title: 'Check For Updates',
        description: 'Whether to periodically check for new Particl Core versions or not',
        type: 'boolean',
        default: true,
      },
      frequency: {
        title: 'Frequency',
        description: 'The number of minutes between update checks, if enabled',
        type: 'integer',
        exclusiveMinimum: 0,
        default: 30
      },
      url: {
        title: 'URL',
        description: 'The URL where to download Particl Core binaries from',
        type: 'string',
        // TODO Change this appropriately when the version checker has been implemented
        default: `https://raw.githubusercontent.com/particl/particl-desktop/dev/modules/clientBinaries/clientBinaries.json`
      }
    },
    required: [ 'checkForUpdates', 'frequency', 'url' ],
    default: {}
  },

  isTestnet: {
    title: 'Launch On Testnet',
    description: 'Whether to start core on the test network or not',
    type: 'boolean',
    default: false,
  },

  testnet: {
    title: 'Test Network Configuration',
    description: "Settings for starting or connecting to a test network node",
    type: "object",
    properties: {
      zmqPort: {
        title: 'ZMQ Port',
        description: 'The port on which to listen for zmq updates',
        type: 'number',
        default: 36950
      },
      zmqHost: {
        title: 'ZMQ Host IP Address',
        description: 'The ip address on which to listen for zmq updates',
        type: 'string',
        default: '127.0.0.1'
      },
      corePort: {
        title: 'Particl Core Port',
        description: 'The port number to connect to Particl Core',
        type: 'number',
        default: 51935
      },
      coreHost: {
        title: 'Particl Core Host IP Address',
        description: 'The ip address on which to connect to Particl Core',
        type: 'string',
        default: '127.0.0.1'
      },
      params: {
        title: 'Additional Startup Parameters',
        description: "Arguments to pass to Particl Core on startup",
        type: "array",
        items: {
          type: "string",
          pattern: "^\-.?.*$",
        },
        uniqueItems: true
      },
    },
    required: [ 'zmqPort', 'zmqHost', 'corePort', 'coreHost' ],

    default: {}
  },

  mainnet: {
    title: 'Main Network Configuration',
    description: "Settings for starting or connecting to a main network (ie: real money) node",
    type: "object",
    properties: {
      zmqPort: {
        title: 'ZMQ Port',
        description: 'The port on which to listen for zmq updates',
        type: 'number',
        default: 36750
      },
      zmqHost: {
        title: 'ZMQ Host IP Address',
        description: 'The ip address on which to listen for zmq updates',
        type: 'string',
        default: '127.0.0.1'
      },
      corePort: {
        title: 'Particl Core Port',
        description: 'The port number to connect to Particl Core',
        type: 'number',
        default: 51735
      },
      coreHost: {
        title: 'Particl Core Host IP Address',
        description: 'The ip address on which to connect to Particl Core',
        type: 'string',
        default: '127.0.0.1'
      },
      params: {
        title: 'Additional Startup Parameters',
        description: "Arguments to pass to Particl Core on startup",
        type: "array",
        items: {
          type: "string",
          pattern: "^\-.?.*$",
        },
        uniqueItems: true
      },
    },
    required: [ 'zmqPort', 'zmqHost', 'corePort', 'coreHost' ],
    default: {}
  },
});


const STARTED_STATUS = {
  STOPPED: 0,
  STARTING: 1,
  STARTED: 2,
};


module.exports = class ParticlCore extends CoreInstance {

  #settings;
  #cancelSignal;
  #status = {
    started: STARTED_STATUS.STOPPED,
    hasError: false,
    status: '',
  };

  constructor(settingsPath, abortControllerSignal) {
    super(settingsPath);

    this.#cancelSignal = abortControllerSignal;

    this.#settings = new _electronStore({
      schema: SETTING_SCHEMA,
      // migrations: migrations,
      name: 'particl-core',
      cwd: settingsPath,
      fileExtension: 'json',
      clearInvalidConfig: false,
      accessPropertiesByDotNotation: true,
    });
  }


  getSettings() {
    return { schema: SETTING_SCHEMA, values: this.#settings.store };
  }

  updateSettings(newSettings) {
    // TODO: some validation here would probably be necessary, maybe instead return some sort of error on failed update
    try {
      this.#settings.set(newSettings);
      return true;
    } catch(_) {
      return false;
    }
  }


  async initialize() {
    if (this.#cancelSignal.aborted) return;
    const settings = this.#settings.store;

    if (settings.startup.autoStart) {
      // launch the application
    }
  }


  async start() {

  }


  async stop() {

  }


  #updateStatus(key, value) {
    this.#status[key] = value;
    this.emit('status', this.#status);
  }


  #validateBinary() {

  }


  #downloadBinary() {

  }
}
