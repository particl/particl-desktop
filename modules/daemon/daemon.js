const electron = require('electron');
const log      = require('electron-log');
const spawn    = require('child_process').spawn;
const rxIpc    = require('rx-ipc-electron/lib/main').default;

const _options      = require('../options');
const rpc           = require('../rpc/rpc');
const cookie        = require('../rpc/cookie');
const daemonManager = require('../daemon/daemonManager');

let daemon;
let exitCode = 0;

exports.start = function(wallets, callback) {
  return (new Promise((resolve, reject) => {

    let   options    = _options.get();
    const daemonPath = options.customdaemon
                     ? options.customdaemon
                     : daemonManager.getPath();

    exports.check().then(() => {
      log.info('daemon already started');
      resolve(undefined);

    }).catch(() => {

      wallets = wallets.map(wallet => `-wallet=${wallet}`);
      log.info(`starting daemon ${daemonPath} ${process.argv} ${wallets}`);

      const child = spawn(daemonPath, [...process.argv, ...wallets])
      .on('close', code => {
        if (code !== 0) {
          reject();
          log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
        } else {
          log.info('daemon exited successfully');
        }
        electron.app.quit();
      })
      child.stdout.on('data', data => {
        log.info('daemon: ' + data.toString().replace(/[\n\r]/g, ""))
      })
      child.stderr.on('data', data => {
        log.error('daemon: ' + data.toString().replace(/[\n\r]/g, ""))
      });

      daemon = child;
      exports.wait(wallets, callback).then(() => resolve());
    });

  }));
}

exports.wait = function(wallets, callback) {
  return new Promise((resolve, reject) => {

    const maxRetries  = 10; // Some slow computers...
    let   retries     = 0;
    let   errorString = '';

    const daemonStartup = () => {
      exports.check()
      .then(() => { callback(); resolve(); })
      .catch(() => {
        if (exitCode == 0 && retries < maxRetries) {
          setTimeout(daemonStartup, 1000);
        }
      });

      retries++;
      if (exitCode || retries >= maxRetries) {
        // Rebuild block and transaction indexes
        if (errorString.includes('-reindex')) {
          log.info('Corrupted block database detected, '
                 + 'restarting the daemon with the -reindex flag.');
          process.argv.push('-reindex');
          exitCode = 0; // Hack a bit here...
          // We don't want it to exit at this stage if start was called..
          // it will probably error again if it has to.
          exports.start(wallets, callback);
          return ;
        }
        electron.app.exit(991);
        reject();
      }
    } /* daemonStartup */

    if (daemon && exitCode === 0) {
      daemon.stderr.on('data', data => {
        errorString = data.toString('utf8');
      });
      setTimeout(daemonStartup, 1000);
    }

  });
}

exports.check = function() {
  return new Promise((resolve, reject) => {

    const _timeout = rpc.getTimeoutDelay();
    let auth = cookie.getAuth(_options.get());
    rpc.setTimeoutDelay(150);
    rpc.call('getnetworkinfo', null, (error, response) => {
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
  return new Promise((resolve, reject) => {

    if (daemon && !daemon.exitCode) {
      rpc.call('stop', null, (error, response) => {
        if (error) {
          log.error('Calling SIGINT!');
          reject();
        } else {
          log.debug('Daemon stopping gracefully');
          resolve();
        }
      });
    } else resolve();

  }).catch(() => daemon.kill('SIGINT'));
}
