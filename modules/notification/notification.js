const rxIpc        = require('rx-ipc-electron/lib/main').default;
const log          = require('electron-log');
const path         = require('path');
const Observable   = require('rxjs/Observable').Observable;
const notification = require('electron-notify');

exports.init = function () {
  console.log("notification init");
  notification.setConfig({
    appIcon: 'assets/icons/notification.png',
    displayTime: 3000
  });
  rxIpc.registerListener('notification', (title, desc, params) => {
    console.log('got notification', title, desc, params);
    notification.notify({ title: title, text: desc });
    return Observable.create(observer => observer.complete(true));
  });
}

// todo: test
exports.destroy = function() {
  rxIpc.removeListeners('notification');
}
