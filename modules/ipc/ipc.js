const rxIpc       = require('rx-ipc-electron/lib/main').default;
const log         = require('electron-log');

exports.daemonReady = function(webContents) {
  return new Promise ((resolve, reject) => {

    rxIpc.runCommand('front-walletready', webContents).subscribe(() => {
      resolve(chosen);
    }, err => log.error(err));

  }).catch(error => log.error(error))
}
