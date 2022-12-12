const log = require('electron-log');
const { Observable } = require('rxjs');
const settingsManager = require('./settingsManager');


exports.channels = {

  on: {
    'log': (_, level, ...messages) => {
      if (log.levels.includes(level)) {
        for (const msg of messages) {
          log[level](`[UI log]: ${msg}`);
        }
      }
    }
  },


  invoke: {

    'settings': () => {
      return new Observable(observer => {

        const defaultConfig = settingsManager.getSettings(null);
        const returnValues = {
          VERSIONS: {},
          DEBUGGING_LEVEL: '',
          MODE: '',
          TESTING_MODE: false,
          LANGUAGE: 'en-US'
        };

        if (Object.prototype.toString.call(defaultConfig) !== '[object Object]') {
          observer.error(returnValues);
        } else {
          returnValues.VERSIONS = defaultConfig.VERSIONS;
          returnValues.DEBUGGING_LEVEL = log.transports.console.level;
          returnValues.MODE = defaultConfig.MODE;
          returnValues.TESTING_MODE = defaultConfig.TESTING_MODE;
          returnValues.ALLOWED_EXTERNAL_URLS = defaultConfig.ALLOWED_EXTERNAL_URLS.custom;
          observer.next(returnValues);
        }
        observer.complete();
      });
    },


    'setSetting': (_, key, newValue, oldValue) => new Observable(observer => {
      let success = false;

      if (key === 'DEBUGGING_LEVEL' && log.levels.includes(newValue)) {
        try {
          if (log.transports.file.level) {
            log.transports.file.level = newValue;
          }
          if (log.transports.console.level) {
            log.transports.console.level = newValue;
          }
          success = true;
        } catch (_) { }
      } else if (key === 'ALLOWED_EXTERNAL_URLS') {
        success = settingsManager.updateSetting(key, newValue, oldValue);
      }

      observer.next(success);
      observer.complete();
    }),
  },
};
