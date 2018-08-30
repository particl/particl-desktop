/* electron */
const electron      = require('electron').app;
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');

const Observable = require('rxjs/Observable').Observable;

/*
  Register and IPC listener and execute settings.
*/

let settings;
exports.init = function () {
  rxIpc.registerListener('settings-gui', function (options) {
    settings = options;
    return Observable.create(observer => {
      observer.complete(true);
    });
  });
}

exports.minimizeWindow = function(mainWindow, event) {
  // Minimize when clicking the close button of electron window
  if (settings.window.minimize) {
    mainWindow.minimize();
    event.preventDefault();
  }
}

exports.minimizeToTray = function(mainWindow, event) {
  // Minimize to tray
  if (settings.window.tray) {
    mainWindow.hide();
  }
}

// todo: test
exports.destroy = function() {
  rxIpc.removeListeners('settings-gui');
}