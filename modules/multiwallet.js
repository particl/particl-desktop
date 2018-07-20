const app   = require('electron').app;
const spawn = require('buffered-spawn');
const path  = require('path');
const log   = require('electron-log');
const cookie = require('./rpc/cookie');

let wallets = [];

exports.get = function () {
  return new Promise((resolve, reject) => {

    if (wallets.length > 0) {
      resolve(wallets);
    }

    // TODO remove when other platforms tested
    //resolve([]);
    //return;

    spawn('ls', [ cookie.getParticlDatadirPath() ]).then(files => {

      files = files.stdout.split('\n');
      // keep only wallet.dat and wallet_xxxx.dat files
      files = files.filter(file => /(wallet\.dat|wallet_.+\.dat)/.test(file));
      log.debug('found wallets: ' + files);
      // TODO: add wallets to the list for later use (restart, update)
      resolve(files);

    }).catch(error => log.error('Couldn\'t get wallet list', error));

  });
}
