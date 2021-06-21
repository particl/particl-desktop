// This file is loaded whenever a javascript context is created. It runs in a
// private scope that can access a subset of electron renderer APIs. We must be
// careful to not leak any objects into the global scope!
const { contextBridge, ipcRenderer } = require('electron');

const flatten = (obj) => Object.keys(obj)
  .reduce((acc, key) => {
    const val = obj[key];
    return acc.concat(typeof val === 'object' ? flatten(val) : val);
  }, []);

/**
 * SafeIpcRenderer
 *
 * This class wraps electron's ipcRenderer an prevents
 * invocations to channels passed to the constructor. The instance methods
 * are all created in the constructor to ensure that the protect method
 * and validEvents array cannot be overridden.
 *
 */
class SafeIpcRenderer {
  constructor (events) {
    const validEvents = flatten(events);
    const protect = (fn) => {
      return (channel, ...args) => {

        let validChannel = channel;
        if (channel.indexOf(':') !== -1) {
          if (Number.isInteger(+channel.substr(channel.indexOf(':') + 1))) {
            validChannel = channel.substr(0, channel.indexOf(':'));
          }
        }

        if (!validEvents.includes(validChannel)) {
          throw new Error(`Blocked access to unknown channel
            ${channel} ${validChannel} from the renderer`);
        }
        return fn.apply(ipcRenderer, [channel].concat(args));
      };
    };

    this.on                 = protect(ipcRenderer.on);
    this.once               = protect(ipcRenderer.once);
    this.send               = protect(ipcRenderer.send);
    this.sendSync           = protect(ipcRenderer.sendSync);
    this.sendToHost         = protect(ipcRenderer.sendToHost);
    this.removeListener     = protect(ipcRenderer.removeListener);
    this.removeAllListeners = protect(ipcRenderer.removeAllListeners);
    this.listenerCount      = protect(ipcRenderer.listenerCount);
  }
}


// NB! This is no longer the best way of doing this.The correct way is to expose the actual API call that you want to explicitly make and expose them via context bridge,
//  ie: expose the call to 'startSystem() with relevant params, rather than exposing ipcRenderer, even if ipcRenderer limits channel access...
// @TODO: lets get this fixed properly... its left as is for now as there's no damage done, but really needs to be re-considered
const exposedIpc = new SafeIpcRenderer([
  'start-system',
  'zmq-connect',

  'notifications',
  'daemon',
  'close-gui',

  'start-market',
  'stop-market',
  'market-keygen',
  'market-importer',
  'market-export-example-csv',
  'market-export-writecsv',

  'zmq',
  'write-core-config',
  'ipc-delete-wallet',
  'open-system-dialog',

  'rx-ipc-check-reply',
  'rx-ipc-check-listener',

  // 'start-bot-framework',
  // 'stop-bot-framework'
]);

contextBridge.exposeInMainWorld('electron', {
  electron: true,
  ipc: exposedIpc
});
