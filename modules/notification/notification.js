/* electron */
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');
const Notification = require('electron').Notification;

/* node */
const path = require('path');

const Observable = require('rxjs/Observable').Observable;
const util = require('../util/util');

/*
    Register and IPC listener and execute notification.
*/
exports.init = function () {
    rxIpc.registerListener('notification', function (title, desc, params) {
        let notification = new Notification({
            'title': title,
            'body': desc,
            'icon': util.getRootOrResourcePath()
        })
        notification.show()
        return Observable.create(observer => {
            observer.complete(true);
        });
    });
}

// todo: test
exports.destroy = function() {
    rxIpc.removeListeners('notification');
}