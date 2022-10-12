const { Observable } = require('rxjs');
const settingsManager = require('./settingsManager');


exports.channels = {
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
          returnValues.DEBUGGING_LEVEL = defaultConfig.DEBUGGING_LEVEL;
          returnValues.MODE = defaultConfig.MODE;
          returnValues.TESTING_MODE = defaultConfig.TESTING_MODE;
          observer.next(returnValues);
        }
        observer.complete();
      });
    }
  },
};
