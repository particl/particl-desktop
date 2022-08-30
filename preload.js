// This file is loaded whenever a javascript context is created. It runs in a
// private scope that can access a subset of electron renderer APIs. We must be
// careful to not leak any objects into the global scope!
const { contextBridge, ipcRenderer } = require('electron');

// TODO: re-add in all these commands that were previously used (or at least those that are relevant still)
// const exposedIpc = new SafeIpcRenderer([
//   'start-system',
//   'zmq-connect',

//   'notifications',
//   'daemon',
//   'close-gui',

//   'start-market',
//   'stop-market',
//   'market-keygen',
//   'market-importer',
//   'market-export-example-csv',
//   'market-export-writecsv',

//   'zmq',
//   'write-core-config',
//   'ipc-delete-wallet',
//   'open-system-dialog',

//   'rx-ipc-check-reply',
//   'rx-ipc-check-listener',

//   // 'start-bot-framework',
//   // 'stop-bot-framework'
// ]);


// Proxy anything on the .send, .invoke, and .on calls to a specific channel
contextBridge.exposeInMainWorld('electronAPI', {
  electron: true,

  send: (channel, ...args) => {
    ipcRenderer.send('PD_SEND', channel, ...args);
  },

  sendAndWait: (channel, listenerType, ...args) => {
    ipcRenderer.invoke('PD_SEND_AND_WAIT', channel, listenerType, ...args);
  },

  listen: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },

  removeListener: (channel) => {
    ipcRenderer.send('PD_REMOVE_LISTENER', channel);
  },

});
