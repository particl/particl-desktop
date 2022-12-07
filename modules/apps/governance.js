const { Observable } = require('rxjs');
const _electronStore  = require('electron-store');
const _settingsManager = require('../settingsManager');


const SETTING_SCHEMA = {
  url: {
    title: 'URL',
    description: 'The URL to query for proposals.',
    type: 'string',
    pattern: "^(?:http(s)?:\\/\\/)?(\\{chain\\})?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?(\\{chain\\})?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
    default: 'https://raw.githubusercontent.com/dasource/partyman/master/votingproposals/${chain}/metadata.txt'
  },
  pollInterval: {
    title: 'Poll Interval',
    description: 'Number of minutes between re-polling for updated proposals.',
    type: 'integer',
    default: 30,
    minimum: 1,
    maximum: 3600
  }
};

let stateRef;

exports.init = () => {
  if (!stateRef) {
    stateRef = new _electronStore({
      schema: SETTING_SCHEMA,
      // migrations: migrations,
      name: 'governance',
      cwd: _settingsManager.getSettings(null, 'PATHS').config,
      fileExtension: 'json',
      clearInvalidConfig: true,
      accessPropertiesByDotNotation: true,
      projectVersion: _settingsManager.getSettings(null, 'VERSIONS').governance,
    });
  }
}

exports.destroy = () => {
  stateRef = undefined;
}


exports.channels = {
  invoke: {
    'settings': () => {
      return new Observable(observer => {

        if (!stateRef) {
          observer.complete();
          return;
        }

        observer.next({ defaults: Object.freeze(SETTING_SCHEMA), values: stateRef.store });
        observer.complete();
      });
    },

    'update': (_, field, value) => {
      if (!stateRef || (typeof field !== 'string') || field.length === 0) {
        observer.next(false);
        observer.complete();
        return;
      }

      try {
        stateRef.set(field, value);
        observer.next(true);
      } catch (e) {
        observer.next(false);
      }
      observer.complete();
    }
  }
};
