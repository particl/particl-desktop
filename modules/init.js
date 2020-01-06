const electron      = require('electron');
const log           = require('electron-log');
const rxIpc         = require('rx-ipc-electron/lib/main').default;
const Observable    = require('rxjs').Observable;

const daemon        = require('./daemon/daemon');
const daemonWarner  = require('./daemon/update');
const daemonManager = require('./daemon/daemonManager');
const daemonConfig  = require('./daemon/daemonConfig');
const _auth         = require('./webrequest/http-auth');
const notification  = require('./notification/notification');
const closeGui      = require('./close-gui/close-gui');
const market        = require('./market/market');
const bot           = require('./bot/bot');
const systemDialogs = require('./dialogs/dialogs');


let isInitializedGUI = false;
let isInitializedSystem = false;


function setupDaemonManagerListener() {
  daemonManager.on('status', (status, msg) => {

    // warns GUI (if initialized) that daemon is downloading
    if (isInitializedGUI) {
      if (status === 'downloading') {
        daemonWarner.send('A valid Particl Core binary was not found, starting download', 'info');
      } else if (status === 'download') {
        daemonWarner.send(msg, 'update');
      } else if (status === 'error') {
        daemonWarner.send(msg, 'error');
      } else if (status === 'loadConfig') {
        daemonWarner.send(msg, 'info');
      }
    }

    // Done -> means we have a binary!
    if (status === 'done') {
      log.debug('Particl Daemon Manager has found particl core binary... starting');
      daemonWarner.send('Booting Particl Core...', 'info');
      daemonManager.shutdown();
      daemon.start(false).catch(
        (err) => {
          log.error('daemon start error: ', err);
          daemonWarner.send('Daemon startup failed', 'error');
        }
      );
    } else if (status === 'error') {
      log.error('Daemon Manager errored: ' + msg);
      daemonManager.shutdown();

      // Failed to get clientBinaries.json => connection issues?
      if (msg === 'Request timed out') {
        log.error('Unable to fetch the latest clients.');

        // alert that we weren't able to update.
        electron.dialog.showMessageBox({
          type: 'warning',
          buttons: ['Stop', 'Retry'],
          message: 'Unable to check for updates, please check your connection. Do you want to retry?'
        }, (response) => {
          if (response === 0) {
            electron.app.quit();
          } else if(response === 1) {
            daemonManager.init();
          }
        });
      } else if (msg.toLowerCase().indexOf('hash mismatch') !== -1) {
        // show hash mismatch error
        dialog.showMessageBox({
          type: 'warning',
          buttons: ['OK'],
          message: 'Checksum mismatch in downloaded node. Cannot continue'
        }, () => {
          electron.app.quit();
        });

        // throw so the main.js can catch it
        if (!(err.status && err.status === 'cancel')) {
          throw err;
        }
      }
    }
  });
}


function destroySystemListeners() {
  rxIpc.removeListeners('start-system');
}


exports.startSystem = function () {
  log.info('Start system called');

  destroySystemListeners();

  rxIpc.registerListener('start-system', () => {
    return Observable.create(observer => {
      try {
        daemonWarner.send('Checking for running Particl daemon', 'info');
        daemonConfig.loadAuth();
        daemon.check().then(
          () => {
            log.info('Particl daemon already started... connecting!');
            daemonWarner.send('Connecting to already running particl daemon...', 'info');
            const configOptions = daemonConfig.getConfig();
            if (!isInitializedSystem) {
              _auth.setAuthConfig(configOptions);
            }
            daemonWarner.send(configOptions, 'done');
          }
        ).catch(
          () => {
            daemonConfig.clearAuth();
            log.info('Particl daemon instance not running: attempting to boot Particl Core');
            daemonWarner.send('Attempting to boot particl core...', 'info');
            setupDaemonManagerListener();
            daemonManager.init();
          }
        ).then(
          () => {
            isInitializedSystem = true;
          }
        ).catch(
          (error) => {
            log.error(error);
            daemonWarner.send(error, 'error');
          }
        );
        observer.next(true);
      } catch (err) {
        observer.error(_err);
      }

      observer.complete();
    });
  });
}


exports.startGUI = function (mainWindow) {
  if (isInitializedGUI) {
    exports.stopGUI();
  }
  notification.init();
  closeGui.init();
  market.init();
  bot.init();
  daemonConfig.setupComms();

  systemDialogs.init(mainWindow);

  /* Initialize daemonWarner */
  daemonWarner.init(mainWindow);

  isInitializedGUI = true;
}


exports.stopGUI = function() {
  daemonManager.shutdown(); // stops downloads from occuring when the GUI closes.
  notification.destroy();
  closeGui.destroy();

  bot.destroy();
  market.destroy();
  daemonConfig.destroyComms();
  systemDialogs.destroy();
  daemonWarner.destroy();

  isInitializedGUI = false;
}


exports.stopSystem = async function() {
  destroySystemListeners();

  await daemon.stop().catch(
    (err) => {
      log.error('daemon.stop() errored:', err);
    }
  ).then(
    () => {
      log.info('daemon.stop() complete');
    }
  );
  isInitializedSystem = false;
}
