const log           = require('electron-log');
const spawn         = require('child_process').spawn;

const _options      = require('../options');
const rpc           = require('../rpc/rpc');
const daemonManager = require('../daemon/daemonManager');
const daemonWarner  = require('./update');
const daemonConfig  = require('./daemonConfig');
const _auth         = require('../webrequest/http-auth');
const _zmqServices  = require('../zmq/services');

let daemon = undefined;
let authRequested = false;

function daemonData(data, logger) {
  data = data.toString().trim();
  logger(data);
}

let attemptsToStart = 0;
const maxAttempts = 10;
const zmqDefaultPort = 36750;


exports.start = function (doReindex = false, zmqPort = zmqDefaultPort) {

  let options = _options.get();
  const config = daemonConfig.getConfig();

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


      const addedArgs = [];

      if (options.dev) {
        addedArgs.push('-rpccorsdomain=http://localhost:4200');
      }

      if (doReindex) {
        log.info('Adding reindex flag to daemon startup');
        addedArgs.push('-reindex');
      }

      // ZMQ subscription configuration
      for (const zmqService of _zmqServices.required) {
        // NB!!!!!!!!!! DO NOT USE 'localhost' as this WILL fail. NEEDS to be ip based for tcp:// protocol
        addedArgs.push(`-zmqpub${zmqService}=tcp://127.0.0.1:${zmqPort}`);
      }

      const deamonArgs = [...process.argv, ...addedArgs];
      log.info(`starting daemon: ${deamonArgs.join(' ')}`);

      const child = spawn(daemonPath, deamonArgs);

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
          exports.start(true, zmqPort);
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
        daemon = undefined;
        authRequested = false;
        if (code !== 0) {
          reject();
          log.error(`daemon exited with code ${code}.\n${daemonPath}\n${process.argv}`);
        } else {
          log.info('daemon exited successfully');
          resolve();
        }
        log.info('daemon exit complete - we can now quit electron safely! :)');
      });

      log.info('Call RPC stop!');
      rpc.call('stop', null, (error, response) => {
        if (error) {
          log.info('daemon errored to rpc stop - killing it brutally :(');
          daemon.kill('SIGINT');
          reject();
        } else {
          log.info('Daemon stopping gracefully...');
        }
      });
    } else {
      log.info('Daemon not managed by gui.');
      log.info('Daemon disconnecting - we can now quit electron safely! :)');
      resolve();
    }
  });
}
