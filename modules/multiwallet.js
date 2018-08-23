const { app, protocol } = require('electron');
const spawn = require('buffered-spawn');
const path = require('path');
const log = require('electron-log');
const cookie = require('./rpc/cookie');

// directory watcher
const chokidar = require('chokidar');
const { readdirSync, statSync } = require('fs');
const { join, basename } = require('path');
// Single line directory grabber.
const dirs = p =>
  readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());

let wallets = [
  {
    name: 'wallet.dat',
    alreadyLoaded: true
  }
];

function add(wallet) {
  wallets.push({ name: wallet });
}

function init() {
  const particlDataDir = cookie.getParticlDatadirPath();

  // watch the folders
  const glob = join(particlDataDir, 'wallets', 'wallet_*');
  chokidar.watch(glob).on('addDir', dir => add(basename(dir)));

  // Register a custom protocol, which is polled by the front end.
  protocol.registerBufferProtocol(
    'wallets',
    (request, callback) => {
      const list = new Buffer(
        JSON.stringify({
          wallets: wallets
        })
      );
      callback({ mimeType: 'application/json', data: list });
    },
    error => {
      if (error) console.error('Failed to register protocol');
    }
  );
}

function get() {
  return new Promise((resolve, reject) => {
    if (wallets.length > 0) {
      resolve(wallets);
    }

    // TODO remove when other platforms tested
    resolve([]);
    return;

    spawn('ls', [cookie.getParticlDatadirPath()])
      .then(files => {
        files = files.stdout.split('\n');
        // keep only wallet.dat and wallet_xxxx.dat files
        files = files.filter(file => /(wallet\.dat|wallet_.+\.dat)/.test(file));
        log.debug('found wallets: ' + files);
        // TODO: add wallets to the list for later use (restart, update)
        resolve(files);
      })
      .catch(error => log.error("Couldn't get wallet list", error));
  });
}

exports.init = init;
exports.get = get;
