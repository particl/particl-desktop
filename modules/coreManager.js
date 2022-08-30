const log = require('electron-log');
const EventEmitter = require('events');
const { BehaviorSubject } = require('rxjs');
const settingsManager = require('./settingsManager');
const CoreInstance = require('./coreInstance');


const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};


const availableCores = [
  { label: 'particl', module: './daemon/particlcore' },
];


const abortController = new AbortController();
const coreInstances = {};
const coreStatuses = {};

let status$ = new BehaviorSubject({});


exports.init = () => {
  for (const core of availableCores) {
    if (core.label.length > 0 && core.module.length > 0) {
      log.info(`Loading core instance "${core.label}"`);
      try {
        const mod = require(core.module);
        const obj = new mod(settingsManager.getSettings(null, 'PATHS').config, abortController.signal);

        if ((obj instanceof EventEmitter) && (obj instanceof CoreInstance)) {
          coreInstances[core.label] = obj;
          coreStatuses[core.label] = null;

          coreInstances[core.label].on('status', (status) => {
            coreStatuses[core.label] = status;
            status$.next(coreStatuses);
          });
          log.info(`Loaded core instance "${core.label}"`);
        }
      } catch (err) {
        log.error('Core instance load error: ', err);
      }
    }
  }

  if (abortController.signal.aborted) {
    abortController = new AbortController();
  }

  status$.next(coreStatuses);
}


exports.destroy = async () => {

  abortController.abort();

  for (const coreLabel of Object.keys(coreInstances)) {
    const mod = coreInstances[coreLabel];
    mod.removeAllListeners();
    await mod.stop().catch(err => {
      log.error(`Core instance "${coreLabel}" failed to stop: `, err);
    });
    coreStatuses[coreLabel] = null;
  }

  if (status$ && !status$.isStopped) {
    status$.complete();
  }

}


exports.channels = {
  emitter: {
    status: status$.asObservable(),
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
            observer.next({core: coreLabel, request: 'update', status: success});
          } else {
            const settings = coreInstances[coreLabel].getSettings();
            if (!(isObject(settings) && ('schema' in settings) && isObject(settings.schema) && ('values' in settings) && isObject(settings.values))) {
              throw new Error('Invalid settings object returned');
            }

            observer.next({core: coreLabel, request: 'settings', schema: settings.schema, values: settings.values});
          }

        } catch(err) {
          log.error(`Failed settings request for ${coreLabel} :`, err);
          observer.error('Failed settings request');
        }

        observer.complete();
      });
    }
  },


  on: {

    'initialize': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown initialize request for core "${coreLabel}"`);
        return;
      }
      log.info(`Initializing core "${coreLabel}"`);
      coreInstances[coreLabel].initialize()
        .then(() => log.info(`Initialized core "${coreLabel}"`))
        .catch(err => log.error(`Initialization of core "${coreLabel}" failed: `, err));
    },


    'start': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown start request for core "${coreLabel}"`);
        return;
      }
      log.info(`Starting core "${coreLabel}"`);
      coreInstances[coreLabel].start()
        .then(() => log.info(`Started core "${coreLabel}"`))
        .catch(err => log.error(`Start request for core "${coreLabel}" failed: `, err));
    },


    'stop': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown stop request for core "${coreLabel}"`);
        return;
      }
      log.info(`Stopping core "${coreLabel}"`);
      coreInstances[coreLabel].stop()
        .then(() => log.info(`Stopped core "${coreLabel}"`))
        .catch(err => log.error(`Stopping of core "${coreLabel}" failed: `, err));
    },

  }
}
