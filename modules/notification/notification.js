/* electron */
const electron = require('electron').app;
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');
const Notification = require('electron').Notification;

/* node */
const path = require('path');

const Observable = require('rxjs/Observable').Observable;

/*
    Register and IPC listener and execute notification.
*/
exports.init = function () {
    rxIpc.registerListener('notification', function (title, desc, params) {
        // Fix for windows 10
        electron.setAppUserModelId("io.particl.desktop");
        let notification = new Notification({
            'title': title,
            'body': desc,
            'icon': path.join(__dirname, 'src/assets/icons/notification.png')
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