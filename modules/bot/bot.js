const log = require('electron-log');
const config = require('../daemon/daemonConfig');
const botManager = require('particl-bot-manager');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

// Stores the child process
let child = undefined;

let _options = {};

exports.init = function() {
  rxIpc.registerListener('start-bot-framework', function(walletName) {
    return Observable.create(observer => {
      exports.start(walletName);
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

exports.start = function(walletName) {
  _options = config.getConfiguration();

  if (!child) {
    log.info('bot process starting.');

    const isTestnet = Boolean(+_options.testnet);

    const botOptions = {
      NETWORK: isTestnet ? 'testnet' : 'mainnet',
      BOT_USER: 'test',
      BOT_PASSWORD: 'test',
      RPC_HOSTNAME: _options.rpcbind || 'localhost',
      RPC_PORT:  _options.port,
      ZMQ_SMSG_PORT: '36750',
      WALLET: walletName,
    };

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
