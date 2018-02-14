/* electron */
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');

/* node */
const path = require('path');

const Observable = require('rxjs/Observable').Observable;

/*
    Register and IPC listener and execute notification.
*/
exports.init = function () {
    var eNotify = require('electron-notify');
    eNotify.setConfig({
        appIcon: '../../src/assets/icons/notification.png',
        displayTime: 3000
    });
    rxIpc.registerListener('notification', function (title, desc, params) {
        eNotify.notify({ title: title, text: desc });
        return Observable.create(observer => {
            observer.complete(true);
        });
    });
}

// todo: test
exports.destroy = function() {
    rxIpc.removeListeners('notification');
}