const log         = require('electron-log');
const http        = require('http');
const _options    = require('../daemon/daemonConfig');

/* spyOnRpc will output all RPC calls being made */
const spyOnRpc = false;

const rpcOptions = {
  hostname: '',
  path:     '/',
  method:   'POST',
  headers:  { 'Content-Type': 'application/json' }
}

/*
** execute a single RPC call
*/
exports.call = function(method, params, callback) {

  if (!callback) {
    callback = function (){};
  }

  const timeout = [ 'extkeyimportmaster', 'extkeygenesisimport'].includes(method) ? 240 * 1000 : 30000; // TODO: replace
  const postData = JSON.stringify({
    method: method,
    params: params
  });

  if(spyOnRpc) {
    log.debug('rpc.call:', postData);
  }

  if (!rpcOptions.hostname) {
    const settings = _options.getConfig();
    rpcOptions.hostname = settings.rpcbind || 'localhost';

    if (settings.port) {
      rpcOptions.port = settings.port;
    }
  }

  const settingsAuth = _options.getAuth();
  rpcOptions.auth = settingsAuth || '';
  // rpcOptions.headers['Content-Length'] = postData.length;

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
    return request.destroy();
  });

  request.write(postData);
  request.end();
}
