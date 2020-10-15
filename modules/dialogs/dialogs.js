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
    return Observable.create(observer => {
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

        try {
          retValue = fn(mainWindowRef, dialogOptions);
          observer.next(retValue);
        } catch (_err) {
          observer.error(_err);
        }

      }
      observer.complete();
    });
  });
}

exports.init = initializeIpcChannels;
exports.destroy = destroyIpcChannels;
