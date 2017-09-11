const fs = require('fs');
const os = require('os');
const path = require('path');
const { ipcMain } = require('electron');
const log = require('electron-log');
const http = require('http');
const Observable = require('rxjs/Observable').Observable;
const rxIpc = require('rx-ipc-electron/lib/main').default;

let TIMEOUT = 500;
let HOSTNAME;
let PORT;
let options = undefined;

/*
** returns Particl config folder
*/
function findCookiePath() {

  var homeDir = os.homedir ? os.homedir() : process.env['HOME'];

  var dir,
      appName = 'Particl';
  switch (process.platform) {
    case 'linux': {
      dir = prepareDir(homeDir, '.' + appName.toLowerCase())
        .result;
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

/*
** directory resolver
*/
function prepareDir(dirPath) {
  // jshint -W040
  if (!this || this.or !== prepareDir || !this.result) {
    // if dirPath couldn't be resolved
    if (!dirPath) {
      // return this function to be chained with .or()
      return { or: prepareDir };
    }

    //noinspection JSCheckFunctionSignatures
    dirPath = path.join.apply(path, arguments);
    mkDir(dirPath);

    try {
      fs.accessSync(dirPath, fs.W_OK);
    } catch (e) {
      // return this function to be chained with .or()
      return { or: prepareDir };
    }
  }

  return {
    or: prepareDir,
    result: (this ? this.result : false) || dirPath
  };
}

/*
** create a directory
*/
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

/*
** handle RPC call response
*/
function cb_handleRequestResponse (res, cb) {
  var data = '';
  res.setEncoding('utf8');
  res.on('data', chunk => {data += chunk});
  res.on('end', () => {
    if (res.statusCode === 401) {
      cb(res);
      return ;
    }
    data = JSON.parse(data);
    cb(null, data);
  });
}

/*
** execute RPC call
*/
function rpcCall (method, params, auth, cb) {
  var postData = JSON.stringify({
    method: method,
    params: params,
    id: '1'
  });

  if (!options) {
    options = {
      hostname: HOSTNAME,
      port: PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      auth: auth ? auth[0] + ':' + auth[1] : undefined
    }
  }
  options.headers['Content-Length'] = postData.length;

  var req = http.request(options, res => cb_handleRequestResponse(res, cb));
  req.on('error', e => cb(e));
  req.setTimeout(TIMEOUT, e => {
    cb(e);
    return (req.abort());
  });
  req.write(postData);
  req.end();
}

/*******************************/
/****** Public functions *******/
/*******************************/

/*
** returns the current RPC cookie
** RPC cookie is regenerated at every particld startup
*/
function getCookie(options) {

  if (options.rpcuser && options.rpcpassword) {
    return ([
      options.rpcuser,
      options.rpcpassword
    ]);
  }

  const COOKIE_FILE = findCookiePath() + `${options.testnet ? '/testnet' : ''}/.cookie`;
  let auth = [];

  if (fs.existsSync(COOKIE_FILE)) {
    auth = fs.readFileSync(COOKIE_FILE, 'utf8').split(':');
  } else {
    auth = undefined;
    console.error('could not find cookie file !');
  }
  return (auth)
}
exports.getCookie = getCookie;

/*
** prepares `backend-rpccall` to receive RPC calls from the renderer
*/
function init(options) {

  HOSTNAME = options.rpcbind;
  PORT = options.port;

  // This is a factory function that returns an Observable
  function createObservable(event, method, params) {
    let auth = getCookie(options);
    return Observable.create(observer => {
      rpcCall(method, params, auth, (error, response) => {
        if (error) {
          observer.error(error);
          return ;
        }
        observer.next(response);
      });
    });
  }
  rxIpc.registerListener('backend-rpccall', createObservable);
}
exports.init = init;

function checkDaemon(testnet) {
  return new Promise((resolve, reject) => {
    rpcCall('getinfo', null, getCookie(testnet), (error, response) => {
      if (error) {
        reject();
      } else if (response) {
        resolve();
      }
    })
  });
}
exports.checkDaemon = checkDaemon;
