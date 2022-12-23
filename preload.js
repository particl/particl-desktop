// This file is loaded whenever a javascript context is created. It runs in a
// private scope that can access a subset of electron renderer APIs. We must be
// careful to not leak any objects into the global scope!
const { contextBridge, ipcRenderer } = require('electron');


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
