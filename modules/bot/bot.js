const log = require('electron-log');
const config = require('../daemon/daemonConfig');
const botManager = require('particl-bot-manager');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

// Stores the child process
let child = undefined;

let _options = {};


const removeIpcListeners = function() {
  rxIpc.removeListeners('start-bot-framework');
  rxIpc.removeListeners('stop-bot-framework');
}


exports.init = function() {
  exports.destroy();
  rxIpc.registerListener('start-bot-framework', function(walletName, portNum) {
    return Observable.create(observer => {
      exports.start(walletName, portNum);
      observer.complete(true);
    });
  });

  rxIpc.registerListener('stop-bot-framework', function() {
    return Observable.create(observer => {
      exports.stop();
      observer.complete(true);
    });
  });
}


exports.destroy = function() {
  exports.stop();
  removeIpcListeners();
}


exports.start = function(walletName, portNum) {
  _options = config.getConfig();

  if (!child) {
    log.info('bot process starting.');

    const isTestnet = Boolean(+_options.testnet);

    const botOptions = {
      ELECTRON_VERSION: process.versions.electron,
      NETWORK: isTestnet ? 'testnet' : 'mainnet',
      BOT_USER: 'test',
      BOT_PASSWORD: 'test',
      RPC_HOSTNAME: _options.rpcbind || 'localhost',
      RPC_PORT:  _options.port,
      ZMQ_SMSG_PORT: '36750',
      WALLET: walletName,
    };

    if ( (typeof portNum === 'number') && (portNum > 0)) {
      botOptions.APP_PORT = portNum;
    }

    child = botManager.start(botOptions);

    child.on('close', code => {
      log.info('bot manager process ended.');
    });

    child.stdout.on('data', data => console.log(data.toString('utf8')));
    child.stderr.on('data', data => console.log(data.toString('utf8')));
  }
}

exports.stop = async function() {
  if (child) {
    log.info('bot manager process stopping.');
    botManager.stop();
    child = null;
  }
}
