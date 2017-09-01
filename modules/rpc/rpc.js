const fs = require('fs');
const os = require('os');
const path = require('path');
const rpc = require('node-bitcoin-rpc');
const { ipcMain } = require('electron');
const log = require('electron-log');
const Observable = require('rxjs/Observable').Observable;
const rxIpc = require('rx-ipc-electron/lib/main').default;

// TODO: Mainnet...
const MAINNET_PORT = 51935;
const TESTNET_PORT = 51935;

const COOKIE_FILE = findCookiePath() + '/testnet/.cookie';

function findCookiePath() {

  var homeDir = os.homedir ? os.homedir() : process.env['HOME'];

  var dir,
      appName = 'Particl';
  switch (process.platform) {
    case 'linux': {
      dir = prepareDir(homeDir, '.' + appName.toLowerCase())
        .result;
        console.log(dir)
      break;
    }

    case 'darwin': {
      dir = prepareDir(homeDir, 'Library', 'Application Support', appName)
        .result;
      break;
    }

    case 'win32': {
      dir = prepareDir(process.env['APPDATA'], appName)
        .or(homeDir, 'AppData', 'Roaming', appName)
        .result;
      break;
    }
  }

  if (dir) {
    return dir;
  } else {
    return false;
  }
}

function prepareDir(dirPath) {
  // jshint -W040
  if (!this || this.or !== prepareDir || !this.result) {
    if (!dirPath) {
      return { or: prepareDir };
    }

    //noinspection JSCheckFunctionSignatures
    dirPath = path.join.apply(path, arguments);
    mkDir(dirPath);

    try {
      fs.accessSync(dirPath, fs.W_OK);
    } catch (e) {
      return { or: prepareDir };
    }
  }

  return {
    or: prepareDir,
    result: (this ? this.result : false) || dirPath
  };
}

function mkDir(dirPath, root) {
  var dirs = dirPath.split(path.sep);
  var dir = dirs.shift();
  root = (root || '') + dir + path.sep;

  try {
    fs.mkdirSync(root);
  } catch (e) {
    if (!fs.statSync(root).isDirectory()) {
      throw new Error(e);
    }
  }

  return !dirs.length || mkDir(dirs.join(path.sep), root);
}

let auth = [];

if (fs.existsSync(COOKIE_FILE))
  auth = fs.readFileSync(COOKIE_FILE, 'utf8').split(':');
console.log(COOKIE_FILE);
//else TODO: No cookie file...

rpc.init('localhost', TESTNET_PORT, auth[0], auth[1]);

// This is a factory function that returns an Observable
function createObservable(event, method, params) {
  return Observable.create(observer => {
    rpc.call(method, params, (error, response) => {
      if (error) {
        observer.error(error);
        return;
      }
      observer.next(response);
    });
  });
}

rxIpc.registerListener('backend-rpccall', createObservable);
