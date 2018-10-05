/* electron */
const electron      = require('electron').app;
const AutoLaunch = require('auto-launch');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');
const market = require('./../market/market');

const Observable = require('rxjs/Observable').Observable;

/*
  Register and IPC listener and execute settings.
*/

let settings;
let autoLauncher = new AutoLaunch({
  name: electron.getName(),
  mac: {
    useLaunchAgent: true
  }
});

// market enabled state update?
let marketRunningState;

exports.init = function () {
  rxIpc.registerListener('settings-gui', function (options) {
    settings = options;
    // autolaunch if setting says autostart
    if (settings.window.autostart) {
      autoLauncher.isEnabled()
      .then(function(isEnabled){
        if(isEnabled){
          return;
        }
        autoLauncher.enable();
      })
    }
    else {
      autoLauncher.disable();
    }

    return Observable.create(observer => {
      observer.complete(true);
    });
  });
}

exports.minimizeOnClose = function(mainWindow, event) {
  // Minimize when clicking the close button of electron window
  if (settings && settings.window.minimize) {
    mainWindow.minimize();
    event.preventDefault();
  }
}

exports.minimizeToTray = function(mainWindow) {
  // Minimize to tray
  if (settings && settings.window.tray) {
    mainWindow.hide();
  }
}

// todo: test
exports.destroy = function() {
  rxIpc.removeListeners('settings-gui');
}