/* electron */
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');
const Notification = require('node-notifier');

/* node */
const path = require('path');

const Observable = require('rxjs/Observable').Observable;

/*
    Register and IPC listener and execute notification.
*/
exports.init = function () {
    rxIpc.registerListener('notification', function (title, desc, params) {
        Notification.notify({
            'title': title,
            'message': desc,
            'icon': 'src/assets/icons/notification.png',
            'sound': true,
            'wait': false,
        })
        return Observable.create(observer => {
            observer.complete(true);
        });
    });
}

// todo: test
exports.destroy = function() {
    rxIpc.removeListeners('notification');
}