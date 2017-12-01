const electron      = require('electron');
const log           = require('electron-log');

const ipc           = require('./ipc/ipc');
const daemon        = require('./daemon/daemon');
const daemonManager = require('./daemon/daemonManager');
const multiwallet   = require('./multiwallet');

// TODO move to a proper place
function daemonStarted() { log.info('daemon started'); }
// function daemonStarted() {
//   setTimeout(() => {
//     daemon.restart(() => console.log('YISSS!'))
//   }, 10000);
// }

exports.start = function (mainWindow) {

  ipc.init();

  daemon.check()
    .then(()            => log.info('daemon already started'))
    .catch(()           => daemonManager.init())
    .then(()            => multiwallet.get())
    // TODO: activate for prompting wallet
    // .then(wallets       => ipc.promptWalletChoosing(wallets, mainWindow.webContents))
    .then(chosenWallets => daemon.start(chosenWallets, daemonStarted));
    // TODO: activate for daemon ready IPC message to RPCService
    // .then(()            => ipc.daemonReady(mainWindow.webContents))
}

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
