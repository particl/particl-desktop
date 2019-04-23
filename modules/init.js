const electron      = require('electron');
const log           = require('electron-log');

const rpc           = require('./rpc/rpc');
const zmq           = require('./zmq/zmq');

const daemon        = require('./daemon/daemon');
const daemonWarner  = require('./daemon/update');
const daemonManager = require('./daemon/daemonManager');
const daemonConfig  = require('./daemon/daemonConfig');
const multiwallet   = require('./multiwallet');
const notification  = require('./notification/notification');
const closeGui      = require('./close-gui/close-gui');
const market        = require('./market/market');


exports.start = function (mainWindow) {
  // Initialize IPC listeners
  notification.init();
  closeGui.init();
  daemon.init();
  market.init();

  /* Initialize ZMQ */
  zmq.init(mainWindow);
  // zmq.test(); // loop, will send tests

  /* Initialize daemonWarner */
  daemonWarner.init(mainWindow);

  exports.startDaemonManager();
}

exports.startDaemonManager = function() {
  daemon.check()
    .then(()            => log.info('daemon already started'))
    .catch(()           => daemonManager.init(daemonConfig.getConfiguration()))
    .catch((error)      => log.error(error));
}

/*
  Start daemon when we get the GO sign from daemonManager.
  Listen for daemonManager errors too..

  Only happens _after_ daemonManager.init()
*/
daemonManager.on('status', (status, msg) => {

  // warns GUI that daemon is downloading
  if (status === "download") {
    daemonWarner.send(msg);
  }

  // Done -> means we have a binary!
  if (status === 'done') {
    log.debug('daemonManager returned successfully, starting daemon!');
    daemonManager.shutdown();
    multiwallet.get()
    // TODO: activate for prompting wallet
    .then(chosenWallets => {
      daemon.start().then(() => {
        rpc.init();
      });
    })
    .then(() => {
      daemonConfig.send();
    })
    .catch(err          => log.error(err));
    // TODO: activate for daemon ready IPC message to RPCService


  } else if (status === 'error') {
    // Failed to get clientBinaries.json => connection issues?
    if (msg === 'Request timed out') {
      log.error('Unable to fetch the latest clients.');

      // alert that we weren't able to update.
      electron.dialog.showMessageBox({
        type: 'warning',
        buttons: ['Stop', 'Retry'],
        message: 'Unable to check for updates, please check your connection. Do you want to retry?'
      }, (response) => {
        if(response === 1) {
          exports.startDaemonManager();
        }
      });
    }

    log.debug('daemonManager errored: ' + msg);
  }

});

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

electron.app.on('before-quit', async function beforeQuit(event) {
  log.info('received quit signal, cleaning up...');

  event.preventDefault();
  electron.app.removeListener('before-quit', beforeQuit);

  // destroy IPC listeners
  rpc.destroy();
  daemonWarner.destroy();
  daemonConfig.destroy();
  notification.destroy();
  closeGui.destroy();

  daemonManager.shutdown();
  market.stop()
  .then(() => sleep(2000))
  .then(async () => {
    await daemon.stop().catch(() => {
      // Shutting down now, so a rejection or error should not stop the rest of the app shutting down, ie: do nothing
    })
  })
  .then(() => {
    log.info('daemon.stop() resolved!');
  });
});

electron.app.on('quit', (event, exitCode) => {
  log.info('Exiting!');
});
