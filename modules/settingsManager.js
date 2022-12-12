const Ajv             = require('ajv');
const path            = require('path');
const fs              = require('fs');
const _electronStore  = require('electron-store');
const packageJson     = require('../package.json');
const mpPackageJson   = require('../node_modules/@zasmilingidiot/particl-marketplace/package.json');
const { parse } = require('path');


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

const CONFIGURABLE_SCHEMA = {
  updates: {
    type: 'object',
    properties: {
      enabled: {
        type: 'boolean',
        default: true,
      },
      url: {
        title: 'URL',
        description: 'The URL to query for proposals.',
        type: 'string',
        pattern: "(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
        default: 'https://api.github.com/repos/particl/particl-desktop/releases/latest'
      }
    },
    required: ['enabled', 'url'],
    default: {}
  },
  userURLS: {
    type: 'array',
    items: {
      type: 'string',
      pattern: "(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
    },
  }

};


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
      type: 'object',
      properties: {
        default: {
          type: 'array',
          items: {
            type: 'string',
            pattern: "(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
          },
          uniqueItems: true,
        },
        custom: {
          type: 'array',
          items: {
            type: 'string',
            pattern: "(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
          }
        }
      }
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
    },

    'VERSIONS': {
      type: 'object',
      properties: {
        app: { type: 'string' },
        wallet: { type: 'string' },
        marketplace: { type: 'string' },
        governance: { type: 'string' }
      },
      required: ['app']
    },

    'TESTING_MODE': {
      type: 'boolean',
      default: false,
    },

    'LANGUAGE': {
      type: 'string',
      default: 'en-US',
    },

    'APPLICATION_UPDATES_ALLOWED': {
      type: 'boolean',
      default: false,
    },

    'APPLICATION_UPDATES_URL': {
      type: 'string',
    },
  },
  required: ['MODE', 'DEBUGGING_LEVEL', 'VERSIONS' ],
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

        case '-force-mode-test':
          options.TESTING_MODE = true;
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
  #userSettingStore;

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
      ALLOWED_EXTERNAL_URLS: { default: urlsAllowed, custom: [] },
      STARTUP_WITH_DEVTOOLS: false,
      PATHS: {
        logs: path.join(this.#basePath, 'logs'),
        config: path.join(this.#basePath, 'settings'),
        binaries: path.join(this.#basePath, 'binaries'),
      },
      VERSIONS: {
        app: packageJson.version,
        wallet: packageJson.appVersions.wallet,
        marketplace: mpPackageJson.version,
        governance: packageJson.appVersions.governance,
      },
      TESTING_MODE: packageJson.version.includes('test'),
    };

    const parsedArgs = parseCliArgs();

    for (const key of Object.keys(parsedArgs)) {
      if (defaultSettings[key] !== undefined) {
        defaultSettings[key] = parsedArgs[key];
      }
    }

    if (defaultSettings.MODE === 'developer') {
      const devBasePath = [this.#basePath, 'developer'];
      defaultSettings.PATHS.logs = path.join(...devBasePath, 'logs');
      defaultSettings.PATHS.config = path.join(...devBasePath, 'settings');
    }

    if (!this.#userSettingStore) {
      try {
        this.#userSettingStore = new _electronStore({
          schema: CONFIGURABLE_SCHEMA,
          // migrations: migrations,
          name: 'ParticlDesktop',
          cwd: defaultSettings.PATHS.config,
          fileExtension: 'json',
          clearInvalidConfig: true,
          accessPropertiesByDotNotation: true,
        });
      } catch(_) {
        return false;
      }
    }

    const userUrls = [];
    let enabledAppUpdates = true;
    let enabledUpdatesUrl = '';
    if (this.#userSettingStore) {
      const definedUrls = this.#userSettingStore.get('userURLS', []);
      definedUrls.forEach(definedUrl => userUrls.push(definedUrl));

      enabledAppUpdates = this.#userSettingStore.get('updates.enabled', enabledAppUpdates);
      enabledUpdatesUrl = this.#userSettingStore.get('updates.url', enabledUpdatesUrl);
    }

    defaultSettings.ALLOWED_EXTERNAL_URLS.custom = [...userUrls];
    defaultSettings.APPLICATION_UPDATES_ALLOWED = enabledAppUpdates;
    defaultSettings.APPLICATION_UPDATES_URL = enabledUpdatesUrl;

    if (this.#defaultValidator(defaultSettings)) {
      this.#settings.set(this.#defaultSettingsKey, defaultSettings);
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
    return Object.freeze(JSON.parse(JSON.stringify(settings)));
  }


  updateSetting(key, newValue, oldValue) {
    let success = false;
    if (key === 'ALLOWED_EXTERNAL_URLS') {
      if (!this.#userSettingStore) {
        return false;
      }

      success = true;
      const isAdding = typeof newValue === 'string' && newValue.length > 0;
      let customAllowedUrls = this.#userSettingStore.get('userURLS', []);
      if (isAdding) {
        customAllowedUrls.push(newValue);
      } else if (typeof oldValue === 'string' && oldValue.length > 0) {
        customAllowedUrls = customAllowedUrls.filter(u => u !== oldValue);
      } else {
        success = false;
      }

      if (success) {
        try {
          this.#userSettingStore.set('userURLS', customAllowedUrls );
          this.#settings.get(this.#defaultSettingsKey).ALLOWED_EXTERNAL_URLS.custom = customAllowedUrls;
        } catch (_) {
          success = false;
        }
      }
    }

    if (key === 'APPLICATION_UPDATES_ALLOWED') {
      if (typeof newValue === 'boolean') {
        try {
          this.#userSettingStore.set('updates.enabled', newValue );
          const config = this.#settings.get(this.#defaultSettingsKey);
          config.APPLICATION_UPDATES_ALLOWED = newValue;
          this.#settings.set(this.#defaultSettingsKey, config);
          success = true;
        } catch (_) { }
      }
    }

    return success;
  }
}


const settingsManager = new AppSettingsManager();

module.exports = settingsManager;
