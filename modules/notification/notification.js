/* electron */
const electron = require('electron').app;
const rxIpc = require('rx-ipc-electron/lib/main').default;
const options = require('../options').get();
const { Notification, BrowserWindow } = require('electron');


/* node */
const path = require('path');
const { Observable } = require('rxjs');

const CHANNEL_NAME = 'notifications';
const currentPathItems = __dirname.split(path.sep);
const basePath = currentPathItems.slice(0, currentPathItems.length - 2).join(path.sep);
const ICON = path.join(basePath, options.dev ? 'src' : 'dist', 'assets', 'icons', 'notification.png');
/*
    Register and IPC listener and execute notification.
*/
exports.init = function () {
    if (process.platform === 'win32') {
      // @TODO zaSmilingIdiot: the appID here, as also used in package.json for electron-builder, is better to be defined in a config file
      // Fix for windows 10
      electron.setAppUserModelId("io.particl.desktop");
    }

    rxIpc.registerListener(CHANNEL_NAME, (title, desc) => {
      return new Observable((subs => {
        let didNotify = false;
        // ensure notifications only appear if the application is unfocused (no point in displaying a popup notification if the user is actively particpiating)
        if ((BrowserWindow.getFocusedWindow() === null) && (typeof title === 'string') && (title.length > 0) && (typeof desc === 'string') && (desc.length > 0)) {
          const nObj = {
            title: title,
            body: desc,
            icon: ICON,
          };
          const notification = new Notification(nObj);
          notification.show();
          didNotify = true;
        }

        subs.next(didNotify);
        subs.complete();
      }));
    });
}

// todo: test
exports.destroy = function() {
    rxIpc.removeListeners(CHANNEL_NAME);
}
