// This file is loaded whenever a javascript context is created. It runs in a
// private scope that can access a subset of electron renderer APIs. We must be
// careful to not leak any objects into the global scope!
const {ipcRenderer} = require('electron');

function sendIPCMessage (channel) {
  console.log(arguments);
  ipcRenderer.send(...arguments);
}

function ipcOn(channel, listener) {
  ipcRenderer.on(channel, listener);
}

function ipcOnce(channel, listener) {
  ipcRenderer.once(channel, listener);
}

function ipcRemove(channel, listener) {
  ipcRenderer.removeListener(channel, listener);
}

window.ipcSend = sendIPCMessage;
window.ipcOn = ipcOn;
window.ipcOnce = ipcOnce;
window.ipcRemove = ipcRemove;
window.electron = true;