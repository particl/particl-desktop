const log = require('electron-log');
const _fetch = require('node-fetch');
const { Observable, Subject, BehaviorSubject, of, timer } = require('rxjs');
const { auditTime, concatMap, tap, takeUntil } = require('rxjs/operators');
const settingsManager = require('./settingsManager');


let updateEmitter = new BehaviorSubject(false);
let checkerSubject;

const UPDATE_TIMEOUT = 180_000;


exports.init = () => {
  if (!checkerSubject) {
    checkerSubject = new Subject();

    checkerSubject.pipe(
      auditTime(30_000),
      concatMap(() => {
        const latestAppSettings = settingsManager.getSettings(null);
        const doCheck = latestAppSettings.APPLICATION_UPDATES_ALLOWED;

        log.info(`Test for Particl Desktop update check, should perform update check: ${doCheck}`);

        if (doCheck) {
          const url = latestAppSettings.APPLICATION_UPDATES_URL;
          const currentAppVersion = latestAppSettings.VERSIONS.app;

          if (typeof url === 'string' && url.length > 0) {
            log.info(`Checking for Particl Desktop new version releases...`);
            return _fetch(
              url,
              { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', }
            ).then(response =>
              response.json()
            ).then(data => {
              if (Object.prototype.toString.call(data) === '[object Object]' && typeof data.tag_name === 'string') {
                log.info(`Found new Particl Desktop version: ${data.tag_name}`);
                return data.tag_name;
              }
              log.info('Invalid release versions object or tag_name property found');
              return '';
            }).catch((err) => {
              log.error(`Check for new Particl Desktop versions failed: ${err && typeof err.message === 'string' ? err.message : err}`);
              return '';
            }).then(targetAppVersion => {
              if (typeof targetAppVersion === 'string' && targetAppVersion.length > 0) {
                const averParts = (currentAppVersion.startsWith('v') ? currentAppVersion.substring(1) : currentAppVersion).split('-');
                const bverParts = (targetAppVersion.startsWith('v') ? targetAppVersion.substring(1) : targetAppVersion).split('-');

                const aVerNums = String(averParts[0] || '').split('.');
                const bVerNums = String(bverParts[0] || '').split('.');

                let isBNewer = false;
                for (let ii = 0; ii < aVerNums.length; ii++) {
                  const aNum = aVerNums[ii] === undefined ? 0 : +aVerNums[ii];
                  const bNum = bVerNums[ii] === undefined ? 0 : +bVerNums[ii];

                  if (aNum === bNum) {
                    continue;
                  }

                  isBNewer = bNum > aNum;
                  break;
                }

                if (isBNewer) {
                  // Ensure that the targetVersion is not a pre-release version if currentVersion is not a pre-release version
                  if (averParts[1] && !bverParts[1]) {
                    isBNewer = false;
                  }
                }
                return isBNewer;
              }
              return false;
            }).then(isNewVersionReleased => {
              const emitValue = typeof isNewVersionReleased === 'boolean' ? isNewVersionReleased : false;
              updateEmitter.next(emitValue);
              return emitValue;
            });
          } else {
            log.error(`Update check aborted: non-existent url`);
          }
        }

        return of('');
      }),

      concatMap(() => {
        return timer(UPDATE_TIMEOUT).pipe(
          tap({ next: () => checkerSubject.next()}),
          takeUntil(checkerSubject)
        )
      })
    ).subscribe();

    checkerSubject.next();
  }

}


exports.destroy = () => {
  try {
    if (checkerSubject) {
      checkerSubject.complete();
      checkerSubject = undefined;
    }
  } catch(_) {}
}


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
          LANGUAGE: 'en-US',
          ALLOWED_EXTERNAL_URLS: [],
          APPLICATION_UPDATES_ALLOWED: true,
        };

        if (Object.prototype.toString.call(defaultConfig) !== '[object Object]') {
          observer.error(returnValues);
        } else {
          returnValues.VERSIONS = defaultConfig.VERSIONS;
          returnValues.DEBUGGING_LEVEL = log.transports.console.level;
          returnValues.MODE = defaultConfig.MODE;
          returnValues.TESTING_MODE = defaultConfig.TESTING_MODE;
          returnValues.ALLOWED_EXTERNAL_URLS = defaultConfig.ALLOWED_EXTERNAL_URLS.custom;
          returnValues.APPLICATION_UPDATES_ALLOWED = defaultConfig.APPLICATION_UPDATES_ALLOWED;
          observer.next(returnValues);
        }
        observer.complete();
      });
    },


    'setSetting': (_, key, newValue, oldValue) => new Observable(observer => {
      let success = false;

      if (key === 'DEBUGGING_LEVEL' && log.levels.includes(newValue)) {
        // temporary (for the current session) change the default debug level
        try {
          if (log.transports.file.level) {
            log.transports.file.level = newValue;
          }
          if (log.transports.console.level) {
            log.transports.console.level = newValue;
          }
          success = true;
        } catch (_) { }
      } else {
        success = settingsManager.updateSetting(key, newValue, oldValue);
        if (success && (key === 'APPLICATION_UPDATES_ALLOWED') && newValue === true) {
          checkerSubject.next();
        }
      }

      observer.next(success);
      observer.complete();
    }),
  },


  emitter: {
    'versionCheck': (_) => updateEmitter,
  }
};
