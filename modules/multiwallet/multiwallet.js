const app = require('electron').app;
const spawn = require('buffered-spawn');
const path = require('path');
const log = require('electron-log');

function getWalletsPath() {
  const platform = process.platform
    .replace('darwin', 'mac')
    .replace('win32', 'win')
    .replace('freebsd', 'linux')
    .replace('sunos', 'linux');
  if (platform == 'linux') {
    return path.join(app.getPath('home'), '.particl');
  } else {
    return app.getPath('userData');
  }
}

exports.get = function () {
  return new Promise((resolve, reject) => {
    spawn('ls', [ getWalletsPath() ]).then(files => {
      files = files.stdout.split('\n');
      // keep only wallet.dat and wallet_xxxx.dat files
      files = files.filter(file => /(wallet\.dat|wallet_.+\.dat)/.test(file));
      log.info('found wallets: ' + files);
      resolve(files);
    }).catch(error => reject(error));
  });
}
