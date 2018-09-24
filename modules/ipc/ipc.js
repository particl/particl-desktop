const Observable  = require('rxjs/Observable').Observable;
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const log         = require('electron-log');

/*
** TODO: move to multiwallet
** Prompt wallet choosing
** instructs the GUI to display a multiwallet choosing modal
** resolves the wallets that the user chose or the wallet if there was just one
** rejects if no wallet was found
*/
exports.promptWalletChoosing = function(wallets, webContents) {
  return new Promise ((resolve, reject) => {

    // TODO: change to user prompt in GUI
    resolve(["wallet.dat"]);
    return ;

    if (wallets.length === 0) {
      log.warn('No walet found in userData.');
      reject();
    } else if (wallets.length == 1) {
      resolve(wallets);
    }

    rxIpc.runCommand('front-choosewallet', webContents, wallets).subscribe(chosen => {
      if (chosen.length === 0) {
        log.error('GUI returned no chosen walllet !');
        reject(chosen);
      } else {
        resolve(chosen);
      }
    }, err => log.error(err));

  }).catch(error => log.error(error))
}

exports.daemonReady = function(webContents) {
  return new Promise ((resolve, reject) => {

    rxIpc.runCommand('front-walletready', webContents).subscribe(() => {
      resolve(chosen);
    }, err => log.error(err));

  }).catch(error => log.error(error))
}
