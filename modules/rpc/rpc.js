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
let options;

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

// remove me
let extkeygenesisdebug = false;
/*
** execute RPC call
*/
function rpcCall (method, params, auth, callback) {

  // temporary clusterfuck stop, move log.error outside of if loop to see
  // why..
  if(method === 'extkeygenesisimport') {
    log.error('DEBUG: params: ', method, params);

    if(extkeygenesisdebug) {
      return;
    }
    extkeygenesisdebug = true;
  }

  const postData = JSON.stringify({
    method: method,
    params: params,
    id: 1
  });

  if (!options) {
    options = {
      hostname: HOSTNAME,
      port: PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }

  if (options.auth !== auth) {
    options.auth = auth
  }

  options.headers['Content-Length'] = postData.length;

  const request = http.request(options, response => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      if (response.statusCode === 401) {
        callback({
          status: 401,
          message: 'Unauthorized'
        });
        return ;
      }
      try {
        data = JSON.parse(data);
      } catch(e) {
        log.error('ERROR: should not happen', e, data);
        callback(e);
      }

      if (data.error !== null) {
        callback(data);
        return;
      }
      callback(null, data);
    });
  });

  request.on('error', error => {
    if (error.code === 'ECONNRESET') {
      callback({
        status: 0,
        message: 'Timeout'
      });
    } else {
      callback(error);
    }
  });

  request.setTimeout(TIMEOUT, error => {
    return request.abort();
  });
  request.write(postData);
  request.end();
}

/*******************************/
/****** Public functions *******/
/*******************************/

/*
** returns the current RPC cookie
** RPC cookie is regenerated at every particld startup
*/
function getAuth(options) {
  if (options.rpcuser && options.rpcpassword) {
    return options.rpcuser + ':' + options.rpcpassword;
  }

  // const COOKIE_FILE = findCookiePath() + `${options.testnet ? '/testnet' : ''}/.cookie`;
  const COOKIE_FILE = findCookiePath() + (options.testnet ? '/testnet' : '') + '/.cookie';
  let auth;

  if (fs.existsSync(COOKIE_FILE)) {
    auth = fs.readFileSync(COOKIE_FILE, 'utf8').trim();
  } else {
    auth = undefined;
    console.error('could not find cookie file !');
    console.error('path: ' + COOKIE_FILE);
  }

  return (auth)
}

/*
** prepares `backend-rpccall` to receive RPC calls from the renderer
*/
function init(options) {
  HOSTNAME = options.rpcbind || 'localhost';
  PORT = options.port;

  // This is a factory function that returns an Observable
  function createObservable(event, method, params) {
    let auth = getAuth(options);
    return Observable.create(observer => {
      rpcCall(method, params, auth, (error, response) => {
        if (error) {
          observer.error(error);
          return;
        }
        observer.next(response);
      });
    });
  }
  rxIpc.registerListener('backend-rpccall', createObservable);
}
exports.init = init;

function checkDaemon(options) {
  return new Promise((resolve, reject) => {
    rpcCall('getnetworkinfo', null, getAuth(options), (error, response) => {
      if (error) {
        // console.log('ERROR:', error);
        reject();
      } else if (response) {
        resolve();
      }
    })
  });
}
exports.checkDaemon = checkDaemon;
