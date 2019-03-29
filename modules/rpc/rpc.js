const log         = require('electron-log');
const http        = require('http');
const rxIpc       = require('rx-ipc-electron/lib/main').default;
const Observable  = require('rxjs/Observable').Observable;

const cookie      = require('./cookie');
const _options    = require('../options');

const daemon      = require('../daemon/daemon');

/* spyOnRpc will output all RPC calls being made */
const spyOnRpc = false;

let HOSTNAME;
let PORT;
let TIMEOUT = 30000;
let rpcOptions;
let auth;

exports.init = function() {
  let options = _options.get();

  HOSTNAME = options.rpcbind || 'localhost';
  PORT     = options.port;
  auth     = cookie.getAuth(_options.get());

  initIpcListener();
}

exports.destroy = function() {
  destroyIpcListener();
}

/*
** execute a single RPC call
*/
exports.call = function(method, params, callback) {

  if (!auth) {
    exports.init()
  }

  if (!callback) {
    callback = function (){};
  }

  const timeout = [ 'extkeyimportmaster', 'extkeygenesisimport'].includes(method) ? 240 * 1000 : TIMEOUT; // TODO: replace
  const postData = JSON.stringify({
    method: method,
    params: params
  });
  
  if(spyOnRpc) {
    log.debug('rpc.call:', postData);
  }

  if (!rpcOptions) {
    rpcOptions = {
      hostname: HOSTNAME,
      port:     PORT,
      path:     '/',
      method:   'POST',
      headers:  { 'Content-Type': 'application/json' }
    }
  }

  if (auth && rpcOptions.auth !== auth) {
    rpcOptions.auth = auth
  }

  rpcOptions.headers['Content-Length'] = postData.length;

  const request = http.request(rpcOptions, response => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      // TODO: more appropriate error handling
      if (response.statusCode === 401) {
        callback({
          status: 401,
          message: 'Unauthorized'
        });
        return ;
      }
      if (response.statusCode === 503) {
        callback({
          status: 503,
          message: 'Service Unavailable',
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
        return ;
      }

      callback(null, data);
    });
  });

  request.on('error', error => {
    switch (error.code) {
      case 'ECONNRESET':
        callback({
          status: 0,
          message: 'Timeout'
        });
        break;
      case 'ECONNREFUSED':
        callback({
          status: 502,
          message: 'Daemon not connected, retrying connection',
          _error: error
        });
        break;
      default:
        callback(error);
    }
  });

  request.setTimeout(timeout, error => {
    return request.abort();
  });

  request.write(postData);
  request.end();
}

exports.getTimeoutDelay = () => { return TIMEOUT }
exports.setTimeoutDelay = function(timeout) { TIMEOUT = timeout }


/*
 * All IPC-related stuff, below here.
*/

function initIpcListener() {

  // Make sure that rpc-channel has no active listeners.
  // Better safe than sorry.
  destroyIpcListener();

  // Register new listener
  rxIpc.registerListener('rpc-channel', (method, params) => {
    return Observable.create(observer => {
      exports.call(method, params, (error, response) => {
        try {
          if(error) {
            observer.error(error);
          } else {
            observer.next(response || undefined);
            observer.complete();
          }
        } catch (err) {
          if (err.message == 'Object has been destroyed') {
            // suppress error
          } else {
            log.error(err);
          }
        }
      });
    });
  });
}

function destroyIpcListener() {
  rxIpc.removeListeners('rpc-channel');
}