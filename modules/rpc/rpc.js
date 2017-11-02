const log         = require('electron-log');
const http        = require('http');

const cookie      = require('./cookie');
const _options    = require('../options/options');

let TIMEOUT = 15000;
let HOSTNAME;
let PORT;
let rpcOptions;
let auth;

exports.init = function() {
  let options = _options.get();

  HOSTNAME = options.rpcbind || 'localhost';
  PORT     = options.port;
  auth     = cookie.getAuth(_options.get());
}

/*
** execute RPC call
*/
exports.call = function(method, params, callback) {

  if (!auth) {
    exports.init()
  }

  if (!callback) {
    callback = function (){};
  }

  const postData = JSON.stringify({
    method: method,
    params: params
  });

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
        return ;
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

exports.setTimeoutDelay = function(timeout) {
  TIMEOUT = timeout;
}

exports.getTimeoutDelay = () => { return TIMEOUT }
