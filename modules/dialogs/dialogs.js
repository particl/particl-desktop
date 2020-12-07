const rxIpc         = require('rx-ipc-electron/lib/main').default;
const { dialog }    = require('electron');
const Observable    = require('rxjs').Observable;

const IPC_CHANNEL_DIALOG = 'open-system-dialog';


function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isFunction(obj) {
  return ['[object Function]', '[object AsyncFunction]'].includes(Object.prototype.toString.call(obj));
}


const destroyIpcChannels = () => {
  rxIpc.removeListeners(IPC_CHANNEL_DIALOG);
}


const initializeIpcChannels = (mainWindowRef) => {
  destroyIpcChannels();

  rxIpc.registerListener(IPC_CHANNEL_DIALOG, (options) => {
    return new Observable(observer => {
      let retValue;

      if (isObject(options) &&
        (typeof options.modalType === 'string') &&
        isFunction(dialog[`show${options.modalType}`])
      ) {
        const fn = dialog[`show${options.modalType}`];
        let dialogOptions = {};
        if (isObject(options.modalOptions)) {
          dialogOptions = options.modalOptions;
        }

        if (options.modalType.toLowerCase().includes('sync')) {
          try {
            const retValue = fn(mainWindowRef, dialogOptions);
            observer.next(retValue);
          } catch (_err) {
            observer.error(_err);
          }
          observer.complete();
        } else {
          fn(mainWindowRef, dialogOptions).then(retValue => {
            if (
              (Object.prototype.toString.call(retValue) === '[object Object]') &&
              !retValue.cancelled &&
              Array.isArray(retValue.filePaths) &&
              (retValue.filePaths.length > 0)
            ) {
                observer.next(retValue.filePaths);
            } else {
              observer.next(null);
            }
          }).catch(
            _err => observer.error(_err)
          ).then(
            () => observer.complete()
          );
        }

      }
    });
  });
}

exports.init = initializeIpcChannels;
exports.destroy = destroyIpcChannels;
