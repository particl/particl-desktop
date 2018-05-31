const rxIpc        = require('rx-ipc-electron/lib/main').default;
const log          = require('electron-log');
const path         = require('path');
const Observable   = require('rxjs/Observable').Observable;
const util = require('../util/util');
const Notification = require('electron-native-notification');

exports.init = function () {
  rxIpc.registerListener('notification', (title, desc, params) => {
    params = params ? params : { }; /* create param object if no param was given */
    params.icon = util.getRootOrResourcePath();
    params.body = desc;
    let notification = new Notification(title, params);
    setTimeout(() => notification.close(), 3000);
    return Observable.create(observer => observer.complete(true));
  });
}

// todo: test
exports.destroy = function() {
  rxIpc.removeListeners('notification');
}
