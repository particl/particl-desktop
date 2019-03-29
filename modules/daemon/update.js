const Observable  = require('rxjs/Observable').Observable;
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const log         = require('electron-log');

/* Constants */
const UPDATE_CHANNEL = 'daemon';

/* references */
let mainReference = null;

exports.init = function (mainWindow) {
    /* 
        Store a reference of the main window (electron),
        which we need for rx-ipc-electron (need to get webContents).
    */
    mainReference = mainWindow;
}

/*
    Sends a message to the Angular frontend, on the channel "update".
*/
exports.send = function(data) {
    data = {
        type: 'update',
        content: data
    };

    try {
      rxIpc.runCommand(UPDATE_CHANNEL, mainReference.webContents, data)
        .subscribe(
        (returnData) => {
            // no return data
        },
        (error) => {
          log.error("update.send: data: " + data + " error: " + error);
        },
        () => {
            // no logging
        }
        );
    } catch (error) {
      log.debug("update.send: failed to runCommand (maybe window closed): " + error);
    }
}

