const log = require('electron-log');
const EventEmitter = require('events');
const { Observable } = require('rxjs');
const settingsManager = require('./settingsManager');
const CoreInstance = require('./coreInstance');


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

          let coreListeners = [];
          try {
            coreListeners = obj.listListeners();
          } catch(_) { }

          if (Array.isArray(coreListeners)) {
            coreListeners.forEach(event => {
              if (typeof event === 'string') {
                exports.channels.emitter[`${core.label}:${event}`] = (_) => {
                  return new Observable(observer => {
                    const listenerFn = value => observer.next(value);
                    obj.on(event, listenerFn);

                    return () => {
                      try {
                        obj.off(event, listenerFn);
                      } catch(_) { }
                    }
                  });
                }
              }
            });
          }

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
    // populated during init function() execution
    // key format is "core_label:event_name", eg: "particl:status"
  },

  invoke: {

    'settings': (_, coreLabel, doUpdate = false, ...args) => {
      return new Observable(observer => {

        const respLabel = doUpdate === true ? 'update' : 'settings';
        try {
          if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
            throw new Error('Settings for an unknown or un-loaded core requested');
          }

          if (doUpdate === true) {
            const success = coreInstances[coreLabel].updateSettings(...args);
            observer.next({core: coreLabel, request: respLabel, response: success, hasError: false});
          } else {
            const settings = coreInstances[coreLabel].getSettings(...args);
            observer.next({core: coreLabel, request: respLabel, response: settings, hasError: false});
          }

        } catch(err) {
          log.error(`Failed settings request for ${coreLabel} :`, err);
          observer.error({core: coreLabel, request: respLabel, response: undefined, hasError: true});
        }

        observer.complete();
      });
    }
  },


  on: {

    'initialize': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown initialize request for Core/Network "${coreLabel}"`);
        return;
      }
      log.info(`Requested init of Core/Network "${coreLabel}"`);
      coreInstances[coreLabel].initialize()
        .then(() => log.info(`Initialized "${coreLabel}"`))
        .catch(err => log.error(`Initialization of Core/Network "${coreLabel}" failed: `, err));
    },


    'start': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown start request for Core/Network "${coreLabel}"`);
        return;
      }
      log.info(`Requested start of Core/Network "${coreLabel}"`);
      coreInstances[coreLabel].start()
        .catch(err => log.error(`Start request for Core/Network "${coreLabel}" failed: `, err));
    },


    'stop': (coreLabel) => {
      if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
        log.error(`Unknown stop request for Core/Network "${coreLabel}"`);
        return;
      }
      log.info(`Requested stop of Core/Network "${coreLabel}"`);
      coreInstances[coreLabel].stop()
        .then(() => log.info(`Stopped "${coreLabel}"`))
        .catch(err => log.error(`Stopping of Core/Network "${coreLabel}" failed: `, err));
    },

  }
};


exports.getCoreSettings = (coreLabel) => {
  if (!(typeof coreLabel === 'string' && (coreLabel in coreInstances))) {
    return null;
  }

  return coreInstances[coreLabel].getSettings();
};
