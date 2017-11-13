const electron      = require('electron');
const log           = require('electron-log');

const ipc           = require('./ipc/ipc');
const daemon        = require('./daemon/daemon');
const daemonManager = require('./daemon/daemonManager');
const multiwallet   = require('./multiwallet');

exports.start = function (mainWindow) {

  ipc.init();

  daemon.check()
    .then(()            => log.info('daemon already started'))
    .catch(()           => daemonManager.init())
    .then(()            => multiwallet.get())
    // TODO: activate for prompting wallet
    // .then(wallets       => ipc.promptWalletChoosing(wallets, mainWindow.webContents))
    .then(chosenWallets => daemon.start(chosenWallets, () => log.info('daemon started')))
    // TODO: activate for daemon ready
    // .then(()            => ipc.daemonReady(mainWindow.webContents))
}

electron.app.on('before-quit', function beforeQuit(event) {
  event.preventDefault();
  electron.ipcMain.removeAllListeners(['rpc-channel']);
  electron.app.removeListener('before-quit', beforeQuit);
  daemon.stop();
});

electron.app.on('quit', (event, exitCode) => {
  if (exitCode === 991) {
    log.error('Could not connect to daemon.')
  }
});
