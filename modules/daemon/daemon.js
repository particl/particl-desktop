const electron = require('electron');
const log = require('electron-log');
const spawn = require('child_process').spawn;
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

const _options = require('../options');
const clearCookie = require('../webrequest/http-auth').removeWalletAuthentication;
const rpc = require('../rpc/rpc');
const cookie = require('../rpc/cookie');
const daemonManager = require('../daemon/daemonManager');
const multiwallet = require('../multiwallet');
const networkConfig       = require('../config/particl-config');

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
        exports.restart(true);
        observer.complete(true);
      } else {
        observer.complete(true);
      }
    });
  });
}

exports.restart = function (alreadyStopping) {
  log.info('restarting daemon...')

  // setup a listener, waiting for the daemon
  // to exit.
  if (daemon) {
    daemon.once('close', code => {
      // clear authentication
      clearCookie();
      
      // restart
      this.start(chosenWallets);
    });
  }

  // wallet encrypt will restart by itself
  if (!alreadyStopping) {
    // stop daemon but don't make it quit the app.
    const restarting = true;
    exports.stop(restarting).then(() => {
      log.debug('waiting for daemon shutdown...')
    });
  }

}

exports.start = function (wallets) {
  return (new Promise((resolve, reject) => {

    chosenWallets = wallets;

    exports.check().then(() => {
      log.info('daemon already started');
      resolve(undefined);

    }).catch(() => {

      let options = _options.get();
      const daemonPath = options.customdaemon
        ? options.customdaemon
        : daemonManager.getPath();

      wallets = wallets.map(wallet => `-wallet=${wallet}`);
      log.info(`starting daemon ${daemonPath} ${process.argv} ${wallets}`);

      const conf = networkConfig.readFile();
      const argumemts = [...process.argv, "-rpccorsdomain=http://localhost:4200", ...wallets];

      if (conf.upnp) {
        argumemts.push(`-upnp`);
      }
      if (conf.proxy) {
        argumemts.push( `-proxy=${conf.proxyIP}:${conf.proxyPort}`);
      }
      log.info(`starting daemon ${argumemts}`);
      const child = spawn(daemonPath, argumemts)
        .on('close', code => {
          log.info('daemon exited - setting to undefined.');
          daemon = undefined;
          if (code !== 0) {
            reject();
            log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
          } else {
            log.info('daemon exited successfully');
          }
        });

      // TODO change for logging
      child.stdout.on('data', data => daemonData(data, console.log));
      child.stderr.on('data', data => {
        daemonData(data, console.log);
      });

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

exports.stop = function (restarting) {
  log.info('daemon stop called..');
  return new Promise((resolve, reject) => {

    if (daemon) {

      // attach event to stop electron when daemon closes.
      // do not close electron when restarting (e.g encrypting wallet)
      if (!restarting) {
        daemon.once('close', code => {
          log.info('daemon exited successfully - we can now quit electron safely! :)');
          electron.app.quit();
        });
      }

      log.info('Call RPC stop!');
      rpc.call('stop', null, (error, response) => {
        if (error) {
          log.info('daemon errored to rpc stop - killing it brutally :(');
          daemon.kill('SIGINT');
          reject();
        } else {
          log.info('Daemon stopping gracefully...');
          resolve();
        }
      });
    } else {
      log.info('Daemon not managed by gui.');
      resolve();
    }

  });
}
