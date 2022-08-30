const Ajv             = require('ajv');
const path            = require('path');
const fs              = require('fs');


const urlsAllowed = [
  "https://explorer.particl.io",
  "https://explorer-testnet.particl.io",
  "https://particl.io",
  "https://particl.news",
  "https://particl.community",
  "https://particl.wiki",
  "https://ccs.particl.io",
  "https://academy.particl.io",
  "https://discordapp.com/invite/2tVJaZ9",
  "https://app.element.io/#/group/+particl:matrix.org",
  "https://t.me/particlproject",
  "https://twitter.com/particlProject",
  "https://www.facebook.com/ParticlProject",
  "https://www.reddit.com/r/Particl",
  "https://fosstodon.org/@particl",
  "https://www.youtube.com/c/Particl",
  "https://bitcointalk.org/index.php?topic=1835782.0",
  "https://github.com/particl"
];


const DEBUG_OPTIONS = ['silly', 'debug', 'info', 'warn', 'error'];
const APP_MODE_OPTIONS = ['developer', 'build'];

const settingsSchema = {
  title: 'Particl Desktop',
  description: 'Settings and configuration options for Particl Desktop client',
  type: 'object',
  properties: {
    'MODE': {
      enum: APP_MODE_OPTIONS
    },

    'DEBUGGING_LEVEL': {
      type: 'string',
      enum: DEBUG_OPTIONS
    },

    'ALLOWED_EXTERNAL_URLS': {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string' }
    },

    'APP_PERMISSIONS': {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string' }
    },

    'STARTUP_WITH_DEVTOOLS': {
      type: 'boolean',
      default: false,
    },

    'PATHS': {
      type: 'object',
      properties: {
        config: { type: 'string' },
        binaries: { type: 'string' }
      },
      required: ['config', 'binaries'],
      additionalProperties: { "type": "string" }
    }
  },
  required: ['MODE', 'DEBUGGING_LEVEL' ],
  additionalProperties: false
};


const parseCliArgs = () => {

  const options = {};

  process.argv
    .slice(process.argv[0].match(/[Ee]lectron/) ? 2 : 1)
    .forEach(arg => {

      const argParts = typeof arg === 'string' ? arg.split('=', 2) : [''];

      switch(argParts[0]) {

        case '-mode':
          if (APP_MODE_OPTIONS.includes(argParts[1])) {
            options.MODE = argParts[1];
          }
          break;

        case '-log':
          if (Number.isInteger(+argParts[1]) && +argParts[1] >= 0 && +argParts[1] < DEBUG_OPTIONS.length) {
            options.DEBUGGING_LEVEL = DEBUG_OPTIONS[+argParts[1]];
          }
          break;

        case '-devtools':
        case '--devtools':
          options.STARTUP_WITH_DEVTOOLS = true;
          break;
      };

    });

  return options;

}


class AppSettingsManager {

  #basePath;
  #settings = new Map();
  #defaultValidator;
  #defaultSettingsKey = 'default';
  #emptySettingsObject = Object.freeze({});

  constructor() {
    this.#defaultValidator = (new Ajv()).compile(settingsSchema);
  }


  setBasePathDir(basePathDir) {
    if (!this.#basePath && typeof basePathDir === 'string' && fs.existsSync(basePathDir)) {
      this.#basePath = basePathDir;
    }
  }


  loadDefaultSettings(forceReload = false) {
    if (!this.#basePath) {
      throw new Error('base path not set! Please set this before load settings');
    }

    if ((forceReload !== true) && this.#settings.has(this.#defaultSettingsKey)) {
      return true;
    }

    const defaultSettings = {
      DEBUGGING_LEVEL: DEBUG_OPTIONS[2],
      MODE: APP_MODE_OPTIONS[0],
      APP_PERMISSIONS: [
        'notifications'
      ],
      ALLOWED_EXTERNAL_URLS: urlsAllowed,
      STARTUP_WITH_DEVTOOLS: false,
      PATHS: {
        logs: path.join(this.#basePath, 'logs'),
        config: path.join(this.#basePath, 'settings'),
        binaries: path.join(this.#basePath, 'binaries'),
      }
    };

    const parsedArgs = parseCliArgs();

    for (const key of Object.keys(parsedArgs)) {
      if (defaultSettings[key] !== undefined) {
        defaultSettings[key] = parsedArgs[key];
      }
    }

    if (this.#defaultValidator(defaultSettings)) {
      this.#settings.set(this.#defaultSettingsKey, Object.freeze(defaultSettings));
      return true;
    }

    return false;
  }


  getSettings(typeLabel, keyPath) {
    const lookupLabel = typeof typeLabel !== 'string' ? this.#defaultSettingsKey : label;
    const settings = this.#settings.has(lookupLabel) ? this.#settings.get(lookupLabel) : this.#emptySettingsObject;

    if (lookupLabel === this.#defaultSettingsKey) {
      if (typeof keyPath === 'string' && keyPath.length > 0) {
        // TODO: allow for object dot-notation lookups
        return keyPath in settings ? settings[keyPath] : null;
      }
    }
    // TODO: does a user config settings lookup with possible dot-notation for keyPath
    return Object.freeze(settings);
  }
}


const settingsManager = new AppSettingsManager();

module.exports = settingsManager;
