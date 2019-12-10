const log           = require('electron-log');
const spawn         = require('child_process').spawn;

const _options      = require('../options');
const rpc           = require('../rpc/rpc');
const daemonManager = require('../daemon/daemonManager');
const daemonWarner  = require('./update');
const daemonConfig  = require('./daemonConfig');
const _auth         = require('../webrequest/http-auth');

let daemon = undefined;
let authRequested = false;

function daemonData(data, logger) {
  data = data.toString().trim();
  logger(data);
}

let attemptsToStart = 0;
const maxAttempts = 10;

exports.start = function (doReindex = false) {
  let options = _options.get();

  if (+options.addressindex !== 1) {
    const daemonSettings = daemonConfig.getSettings();
    if (!(daemonSettings.global && daemonSettings.global.addressindex === 1)) {
      daemonConfig.saveSettings({addressindex: true});
      doReindex = true;
    }
  }

  return (new Promise((resolve, reject) => {

    exports.check().then(() => {
      log.info('daemon already started');
      resolve(undefined);

    }).catch(() => {

      const daemonPath = options.customdaemon
        ? options.customdaemon
        : daemonManager.getPath();


      const addedArgs = [
        "-zmqpubsmsg=tcp://127.0.0.1:36750"
      ];

      if (doReindex) {
        log.info('Adding reindex flag to daemon startup');
        addedArgs.push('-reindex');
      }

      const deamonArgs = [...process.argv, "-rpccorsdomain=http://localhost:4200", ...addedArgs];
      log.info(`starting daemon: ${deamonArgs.join(' ')}`);

      const child = spawn(daemonPath, deamonArgs)
        .on('close', code => {
          log.info('daemon exited - setting to undefined.');
          daemon = undefined;
          authRequested = false;
          if (code !== 0) {
            reject();
            log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
          } else {
            log.info('daemon exited successfully');
          }
        });

      // TODO change for logging
      child.stdout.on('data', data => {
        daemonData(data, console.log);
        if (!authRequested && data.toString().includes('Generated RPC authentication cookie')) {
          authRequested = true;
          daemonConfig.loadAuth();
          const config = daemonConfig.getConfig();
          _auth.setAuthConfig(config);
          daemonWarner.send(config, 'done');
        }
      });
      child.stderr.on('data', data => {
        const err = data.toString('utf8');
        if (err.includes("-reindex") && attemptsToStart < maxAttempts) {
          log.error('Restarting the daemon with the -reindex flag.');
          attemptsToStart++;
          exports.start(true);
        }
        daemonData(data, console.log);
      });

      daemon = child;
    });

  }));
}


exports.check = function () {
  return new Promise((resolve, reject) => {
    rpc.call('getnetworkinfo', null, (error, response) => {
      if (error) {
        reject(error);
      } else if (response) {
        resolve(response);
      }
    });
  });
}


exports.stop = function () {
  log.info('daemon stop called..');
  return new Promise((resolve, reject) => {

    if (daemon) {

      // attach event to stop electron when daemon closes.
      // do not close electron when restarting (e.g encrypting wallet)
      daemon.once('close', code => {
        log.info('daemon exited successfully - we can now quit electron safely! :)');
      });

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
      log.info('Daemon disconnecting - we can now quit electron safely! :)');
      resolve();
    }
  });
}
