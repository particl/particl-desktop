/* electron */
const electron      = require('electron').app;
const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');

const Observable = require('rxjs/Observable').Observable;

/*
    Register and IPC listener and execute notification.
*/
exports.init = function () {
    rxIpc.registerListener('close-gui', function () {
        electron.quit()
        return Observable.create(observer => {
            observer.complete(true);
        });
    });
}

// todo: test
exports.destroy = function() {
    rxIpc.removeListeners('close-gui');
}