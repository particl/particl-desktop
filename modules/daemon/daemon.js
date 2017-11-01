const electron = require('electron');
const log      = require('electron-log');
const spawn    = require('child_process').spawn;
const rxIpc    = require('rx-ipc-electron/lib/main').default;

const options       = require('../options/options');
const rpc           = require('../rpc/rpc');
const daemonManager = require('./../daemon/daemonManager');

let daemon;

exports.start = function(wallets, callback) {
  return (new Promise((resolve, reject) => {

    let _options = options.get();
    const daemonPath = _options.customdaemon
                     ? _options.customdaemon
                     : daemonManager.getPath();

    exports.check().then(() => {
      log.info('daemon already started');
      resolve(undefined);
    }).catch(() => {
      log.info(`starting daemon ${daemonPath}`);
      wallets = wallets.map(wallet => `-wallet=${wallet}`);
      const child = spawn(daemonPath, [...process.argv, ...wallets])
      .on('close', code => {
        if (code !== 0) {
          reject();
          log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
        } else {
          log.info('daemon exited successfully');
        }
      });
      daemon = child;
      exports.wait(wallets, resolve);
    });

  }));
}

exports.wait = function(wallets, callback) {
  const maxRetries = 10; // Some slow computers...
  let retries = 0;
  let errorString = '';

  const daemonStartup = () => {
    exports.check()
      .then(callback)
      .catch(() => {
        if (daemon.exitCode == 0 && retries < maxRetries) {
          setTimeout(daemonStartup, 1000);
        }
      });
    retries++;
    if (daemon.exitCode || retries >= maxRetries) {
      // Rebuild block and transaction indexes
      if (errorString.includes('-reindex')) {
        log.info('Corrupted block database detected, '
               + 'restarting the daemon with the -reindex flag.');
        process.argv.push('-reindex');
        daemon.exitCode = 0; // Hack a bit here...
        // We don't want it to exit at this stage if start was called..
        // it will probably error again if it has to.
        exports.start(wallets, callback);
        return ;
      }
      electron.app.exit(991);
    }
  }

  if (daemon && daemon.exitCode == 0) {
    daemon.stderr.on('data', data => {
      errorString = data.toString('utf8');
    });
    setTimeout(daemonStartup, 1000);
  }
}

exports.check = function() {
  return new Promise((resolve, reject) => {
    const _timeout = rpc.timeout;
    rpc.setTimeoutDelay(150);
    rpc.call(
      'getnetworkinfo', null, cookie.getAuth(options.get()), (error, response) => {
        rxIpc.removeListeners();
        if (error) {
          reject();
        } else if (response) {
          resolve();
        }
      });
    rpc.setTimeoutDelay(_timeout);
  });
}

exports.stop = function() {
  if (daemon && !daemon.exitCode) {
    new Promise((resolve, reject) => {
      rpcCall('stop', null, null, (error, response) => {
        if (error) {
          reject();
        } else {
          resolve();
        }
      });
    }).catch(() => daemon.kill('SIGINT'));
  }
}
