const electron      = require('electron');
const log           = require('electron-log');

const ipc           = require('./ipc/ipc');
const daemon        = require('./daemon/daemon');
const daemonManager = require('./daemon/daemonManager');
const multiwallet   = require('./multiwallet');

// TODO move to a proper place
function daemonStarted() { log.info('daemon started'); }

exports.start = function (mainWindow) {
  ipc.init();
  exports.startDaemonManager();
}

exports.startDaemonManager = function() {
  daemon.check()
    .then(()            => log.info('daemon already started'))
    .catch(()           => daemonManager.init())
    .catch((error)      => log.error(error));
}

/* 
  Start daemon when we get the GO sign from daemonManager.
  Listen for daemonManager errors too..

  Only happens _after_ daemonManager.init()
*/
daemonManager.on('status', (status, msg) => {

  // Done -> means we have a binary!
  if(status === 'done') {
    log.debug('daemonManager returned done, starting daemon!');
    multiwallet.get()
    // TODO: activate for prompting wallet
    // .then(wallets       => ipc.promptWalletChoosing(wallets, mainWindow.webContents))
    .then(chosenWallets => daemon.start(chosenWallets, daemonStarted))
    // .catch(err          => log.error(err));
    // TODO: activate for daemon ready IPC message to RPCService
    // .then(()            => ipc.daemonReady(mainWindow.webContents))


  } else if (status === 'error') {
    // Failed to get clientBinaries.json => connection issues?
    if (msg === 'Request timed out') {
      log.error('Unable to fetch the latest clients.');

      // alert that we weren't able to update.
      electron.dialog.showMessageBox({
        type: 'warning',
        buttons: ['Stop', 'Retry'],
        message: 'Unable to check for updates, please check your connection. Do you want to retry?'
      }, (response) => {
        if(response === 1) {
          exports.start();
        }
      });
    }

    log.debug('daemonManager errored: ' + msg);
  }

});

electron.app.on('before-quit', function beforeQuit(event) {
  event.preventDefault();
  log.debug('received quit signal');
  electron.ipcMain.removeAllListeners(['rpc-channel']);
  electron.app.removeListener('before-quit', beforeQuit);
  daemon.stop();
});

electron.app.on('quit', (event, exitCode) => {
  log.debug('doedoe');
});
