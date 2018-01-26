const Observable  = require('rxjs/Observable').Observable;
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const log         = require('electron-log');

let mainReference = null;

exports.init = function (mainWindow) {
    /* 
        Store a reference of the main window (electron),
        which we need for rx-ipc-electron (need to get webContents).
    */
    mainReference = mainWindow;
}

/*
** 
*/
exports.send = function(channel, ...data) {
    console.log(" [rm] sending coolaid to zmq node -> angular");
    try {
      rxIpc.runCommand('zmq', mainReference.webContents, channel, ...data)
        .subscribe(
        (data) => {
          console.log("data: " + data);
        },
        (err) => {
          console.error(err);
        },
        () => {
          console.log("completed!");
        }
        );
    } catch (error) {
      log.debug("zmq - failed to runCommand (maybe window closed): " + error);
    }

  }

  exports.test = function() {
    exports.send("wtxhash", "somehashtoget");
    setTimeout(exports.test, 30 * 1000);
  }
