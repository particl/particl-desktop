const electron = require('electron');
const log = require('electron-log');
const daemonManager = require('./../clientBinaries/clientBinaries');
const path = require('path');
const rpc = require('./rpc');

let daemon;
let options;
let initialized;

function init(callback) {
  if (!initialized) {
    options = parseArguments();
  }
  rpc.init(options);

  // Daemon already running... Start window
  rpc.checkDaemon(options)
    .then(callback)
    .catch(_ => {
      log.debug('Daemon not running. It will be started bt the daemon manager');
      startDaemon(false, callback);
    });

  initialized = true;
}

function startDaemon(restart, callback) {
  if (restart && daemon) {
    if (daemon.exitCode !== 0) {
      setTimeout(() => startDaemon(restart, callback), 200);
      return false;
    }
  }

  // check for daemon version, maybe update, and keep the daemon's process for exit
  daemonManager.init(!!restart, options).then(child => {
    if (child) {
      daemon = child;
      waitForDaemon(callback);
    }
  }).catch(error => log.error(error));

  return true;
}

function waitForDaemon(callback) {
  const maxRetries = 10; // Some slow computers...
  let retries = 0;
  let errorString = '';
  const daemonStartup = () => {
    rpc.checkDaemon(options)
      .then(callback)
      .catch(() => !daemon.exitCode && retries < maxRetries && setTimeout(daemonStartup, 1000));
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
        if(startDaemon(true, callback)) {
          return;
        }
      }
      electron.app.exit(991);
    }
  }
  if (daemon && !daemon.exitCode) {
    daemon.stderr.on('data', data => {
      errorString = data.toString('utf8');
    });
    setTimeout(daemonStartup, 1000);
  }
}

/*
** compose options from arguments
**
** exemple:
** --dev -testnet -reindex -rpcuser=user -rpcpassword=pass
** strips --dev out of argv (double dash is not a particld argument) and returns
** {
**   dev: true,
**   testnet: true,
**   reindex: true,
**   rpcuser: user,
**   rpcpassword: pass
** }
*/
function parseArguments() {

  let options = {};
  if (path.basename(process.argv[0]).includes('electron')) {

    // striping 'electron .' from argv
    process.argv = process.argv.splice(2);
  } else {
    // striping /path/to/particl from argv
    process.argv = process.argv.splice(1);
    // fixed for development mode only
    if (process.platform === 'darwin') {
      process.argv = process.argv.splice(1);
    }
  }

  process.argv.forEach((arg, index) => {
    if (arg.includes('=')) {
      arg = arg.split('=');
      options[arg[0].substr(1)] = arg[1];
    } else if (arg[1] === '-'){
      // double dash command
      options[arg.substr(2)] = true;
    } else if (arg[0] === '-') {
      // simple dash command
      options[arg.substr(1)] = true;
    }
  });

  options.port = options.rpcport
    ? options.rpcport // custom rpc port
    : options.testnet
      ? 51935  // default testnet port
      : 51735; // default mainnet port

  return options;
}

function getOptions() {
  return options;
}

function stopDaemon() {
  return new Promise((resolve, reject) => {
    rpcCall('stop', null, null, (error, response) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

electron.app.on('quit', function (event, exitCode) {
  console.log('stopping')
  electron.ipcMain.removeAllListeners(['backend-rpccall']); // Remove all ipc listeners
  // kill the particl daemon if initiated on launch
  if (daemon && !daemon.exitCode) {
    stopDaemon()
      .catch(() => daemon.kill('SIGINT'));
  }
  if (exitCode === 991) {
    throw Error('Could not connect to daemon.');
  }
});

exports.getOptions = getOptions;
exports.init = init;
exports.startDaemon = startDaemon;