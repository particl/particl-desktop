const log = require('electron-log');
const EventEmitter = require('events');
const { Observable } = require('rxjs');
const settingsManager = require('./settingsManager');
const CoreInstance = require('./coreInstance');


const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};


const availableCores = [
  { label: 'particl', module: ('./particl-core/particlcore.js') },
];


// keep track of the modules and related data
const coreInstances = {};

exports.init = () => {

  const appConfig = settingsManager.getSettings(null);

  for (const core of availableCores) {
    if (core.label.length > 0 && core.module.length > 0) {
      log.info(`Loading core instance "${core.label}"`);
      try {
        const mod = require(core.module);
        const obj = new mod(appConfig);

        if ((obj instanceof EventEmitter) && (obj instanceof CoreInstance)) {
          coreInstances[core.label] = obj;

          log.info(`Loaded core instance "${core.label}"`);
        }
      } catch (err) {
        log.error('Core instance load error: ', err);
      }
    }
  }
}


exports.destroy = async () => {

  log.info(`Ensure Core instances are stopped...`);
  for (const coreLabel of Object.keys(coreInstances)) {
    const mod = coreInstances[coreLabel];
    await mod.stop()
      .then(() => {
        mod.removeAllListeners();
        delete coreInstances[coreLabel];
      })
      .catch(err => {
        log.error(`"${coreLabel}" errored during stop request: `, err);
      });
  }

  log.info(`Core instance cleanup complete`);

}


exports.channels = {
  emitter: {
    events: (_, coreLabel, eventName) => {
      return new Observable(observer => {

        let listenerFn;

        if (
          (typeof coreLabel === 'string') &&
          (typeof eventName === 'string') &&
          (coreLabel in coreInstances)
        ) {
          try {
            const corelisteners = coreInstances[coreLabel].listListeners();
            if (Array.isArray(corelisteners) && corelisteners.includes(eventName)) {
              listenerFn = (value) => observer.next(value);
            }
          } catch (_) { }
        }

        if (listenerFn) {
          coreInstances[coreLabel].on(eventName, listenerFn);
          return () => {
            try {
              coreInstances[coreLabel].off(eventName, listenerFn);
            } catch(_) { }
          }
        }

        observer.error('Invalid Core or Event requested!');
        observer.complete();
      });
    }
  },

  invoke: {

    'settings': (_, coreLabel, updatedSettings) => {
      return new Observable(observer => {

        try {
          if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
            throw new Error('Settings for an unknown or un-loaded core requested');
          }

          if (updatedSettings !== undefined) {
            if (!isObject(updatedSettings)) {
              throw new Error('Invalid updated settings provided');
            }

            const success = coreInstances[coreLabel].updateSettings(updatedSettings);

            if (typeof success !== 'boolean') {
              throw new Error('Unknown settings update status');
            }
            observer.next({core: coreLabel, request: 'update', status: success, hasError: false});
          } else {
            const settings = coreInstances[coreLabel].getSettings();

            observer.next({core: coreLabel, request: 'settings', settings, hasError: false});
          }

        } catch(err) {
          log.error(`Failed settings request for ${coreLabel} :`, err);
          observer.error({core: coreLabel, request: 'update', status: false, hasError: true});
        }

        observer.complete();
      });
    }
  },


  on: {

    'initialize': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown initialize request for "${coreLabel}"`);
        return;
      }
      log.info(`Initializing "${coreLabel}"`);
      coreInstances[coreLabel].initialize()
        .then(() => log.info(`Initialized "${coreLabel}"`))
        .catch(err => log.error(`Initialization of "${coreLabel}" failed: `, err));
    },


    'start': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown start request for "${coreLabel}"`);
        return;
      }
      log.info(`Requested start for "${coreLabel}"`);
      coreInstances[coreLabel].start()
        .catch(err => log.error(`Start request for "${coreLabel}" failed: `, err));
    },


    'stop': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown stop request for "${coreLabel}"`);
        return;
      }
      log.info(`Requested stop for "${coreLabel}"`);
      coreInstances[coreLabel].stop()
        .then(() => log.info(`Stopped "${coreLabel}"`))
        .catch(err => log.error(`Stopping of "${coreLabel}" failed: `, err));
    },

  }
};


// exports.getStatus = (coreLabel) => {
//   if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
//     return;
//   }

//   return coreStatuses[coreLabel];
// };
