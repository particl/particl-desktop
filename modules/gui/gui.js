const { app, dialog, BrowserWindow } = require('electron');
const { Observable } = require('rxjs');


const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

const isFunction = (obj) => {
  return ['[object Function]', '[object AsyncFunction]'].includes(Object.prototype.toString.call(obj));
};


exports.channels = {
  on: {
    'close-gui': (shouldRestart) => {
      if ((typeof shouldRestart === 'boolean') && shouldRestart) {
        app.relaunch();
      }
      app.quit();
    }
  },

  invoke: {
    'open-dialog': (webContents, options) => {
      return new Observable(observer => {

        const receiverWindow = BrowserWindow.fromWebContents(webContents);

        if (isObject(options) &&
          (typeof options.modalType === 'string') &&
          isFunction(dialog[`show${options.modalType}`]) &&
          (receiverWindow !== null)
        ) {
          const fn = dialog[`show${options.modalType}`];
          let dialogOptions = {};
          if (isObject(options.modalOptions)) {
            dialogOptions = options.modalOptions;
          }

          if (options.modalType.toLowerCase().includes('sync')) {
            // requested synchronous dialog
            try {
              const retValue = fn(receiverWindow, dialogOptions);
              observer.next(retValue);
            } catch (_err) {
              observer.error(_err);
            }
            observer.complete();
          } else {
            // is async dialog
            fn(receiverWindow, dialogOptions)
              .then(retValue => {
                let val = null;
                if (
                  (Object.prototype.toString.call(retValue) === '[object Object]') &&
                  !retValue.cancelled
                ) {
                  if (Array.isArray(retValue.filePaths) && (retValue.filePaths.length > 0)) {
                    val = retValue.filePaths;
                  } else if ((typeof retValue.filePath === 'string') && (retValue.filePath.length > 0)) {
                    val = retValue.filePath;
                  }
                }
                observer.next(val);
              })
              .catch(_err => observer.error(_err))
              .then(() => observer.complete());
          }
        } else {
          observer.complete();
        }
      });
    }
  }
};
