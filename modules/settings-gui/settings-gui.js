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
  rxIpc.registerListener('settings-gui', function (settings) {
    settings = settings;
    return Observable.create(observer => {
      observer.complete(true);
    });
  });
}

exports.minimizeWindow = function(mainWindow) {
  // Minimize when clicking the close button of electron window
  if (settings.window.minimize) {
    mainWindow.minimize();
  } else {
    electron.quit();
  }
}

// todo: test
exports.destroy = function() {
  rxIpc.removeListeners('settings-gui');
}