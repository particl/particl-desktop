const electron = require('electron');
const log = require('electron-log');
const spawn = require('child_process').spawn;
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

const _options = require('../options');
const removeWalletAuthentication = require('../webrequest/http-auth').removeWalletAuthentication;
const rpc = require('../rpc/rpc');
const cookie = require('../rpc/cookie');
const daemonManager = require('../daemon/daemonManager');
const multiwallet = require('../multiwallet');

let daemon = undefined;
let chosenWallets = [];

function daemonData(data, logger) {
  data = data.toString().trim();
  logger(data);
}

exports.init = function () {
  console.log('daemon init listening for reboot')
  rxIpc.registerListener('daemon', (data) => {
    return Observable.create(observer => {
      console.log('got data on daemon channel!');
      if (data && data.type === 'restart') {
        exports.restart(true).then(() => {
          observer.complete(true);
        });
      } else {
        observer.complete(true);
      }
    });
  });
}

exports.restart = function (alreadyStopping) {
  log.info('restarting daemon...')
  return (new Promise((resolve, reject) => {
    // setup a listener, waiting for the daemon
    // to exit.
    if (daemon) {
      daemon.once('close', code => {
        log.info('clearing cookie, encrypt wallet')
        // clear authentication
        removeWalletAuthentication();

        // restart
        this.start(chosenWallets);
        resolve();
      });
    } else {
      // daemon not in our control
      resolve();
    }

    // wallet encrypt will restart by itself
    if (!alreadyStopping) {
      // stop daemon but don't make it quit the app.
      const restarting = true;
      exports.stop(restarting).then(() => {
        log.debug('waiting for daemon shutdown...')
      });
    }
  }));



}

exports.start = function (wallets) {
  return (new Promise((resolve, reject) => {

    chosenWallets = wallets;

    exports.check().then(() => {
      log.info('daemon already running');
      resolve(undefined);

    }).catch(async () => {
      // clear cookie authentication
      // currently used by electron (if reboot)
      removeWalletAuthentication();
      await askForDeletingCookie().catch(() => log.info('cookie: already existed and re-using.'));

      daemon = undefined;

      let options = _options.get();
      const daemonPath = options.customdaemon
        ? options.customdaemon
        : daemonManager.getPath();

      wallets = wallets.map(wallet => `-wallet=${wallet}`);
      log.info(`starting daemon ${daemonPath} ${process.argv} ${wallets}`);

      const child = spawn(daemonPath, [...process.argv, "-rpccorsdomain=http://localhost:4200", ...wallets])
        .on('close', code => {
          if (code !== 0) {
            reject();
            log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
          }
        });

      // TODO change for logging
      child.stdout.on('data', data => daemonData(data, console.log));
      child.stderr.on('data', data => daemonData(data, console.log));

      daemon = child;
    });

  }));
}


exports.check = function () {
  return new Promise((resolve, reject) => {

    const _timeout = rpc.getTimeoutDelay();
    rpc.call('getnetworkinfo', null, (error, response) => {
      if (error) {
        reject(error);
      } else if (response) {
        resolve(response);
      }
    });
    rpc.setTimeoutDelay(_timeout);

  });
}

// Note: this will resolve before the daemon has actually quit.
// do not rely on it. Use daemon.on('close', ...) instead
exports.stop = function (restarting) {
  log.info('daemon stop called..');
  return new Promise((resolve, reject) => {

    if (daemon) {

      // attach event to stop electron when daemon closes.
      // do not close electron when restarting (e.g encrypting wallet)
      if (!restarting) {
        daemon.once('close', code => {
          log.info('daemon exited successfully - quiting electron');
          electron.app.quit();
        });
      }

      log.info('Call RPC stop!');
      _stop();
      resolve();

    } else {
      log.info('Daemon not managed by gui.');
      electron.app.quit();
      resolve();
    }

  });
}

function _stop(attempt = 0) {
  rpc.call('stop', null, (error, response) => {
    if (error) {
      log.info('daemon errored - trying again in a second..')
      // just kill after 180s
      if (attempt >= 180) {
        log.info('daemon errored to rpc stop - killing it brutally :(');
        log.info(error);
        daemon.kill('SIGINT');
      } else {
        // daemon is busy cut it some slack.
        setTimeout(_stop, 1000, ++attempt);
      }
    } else {
      log.info('Daemon stopping gracefully - we can now quit safely :)');
    }
  });
}

function askForDeletingCookie() {
  return new Promise((resolve, reject) => {
    if (cookie.checkCookieExists()) {
      // alert for cookie
      log.info('cookie: dialog open');
      electron.dialog.showMessageBox({
        type: 'warning',
        buttons: ['Yes', 'No'],
        message: `It seems like you already have an instance of Particl running, do you want to connect to that instead? 
                  If you think you're having issues starting the application, select no.`
      }, (response) => {
        if (response === 1) {
          log.info('cookie: deleting');
          cookie.clearCookieFile();
          resolve();
        } else {
          reject();
        }
      });
    } else {
      resolve();
    }
  });
}