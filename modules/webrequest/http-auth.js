const log = require('electron-log');
const { session } = require('electron')
const { URL } = require('url')
const cookie = require('../rpc/cookie');

let OPTIONS = {};

// Modify the user agent for all requests to the following urls.
const filter = {
    urls: ['*']
}

let whitelist = new Map();

exports.init = function (_options) {
    exports.reloadConfig(_options);

    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        // clone it
        const url = new URL(details.url);
        const u = url.hostname + ":" + (url.port || 80);

        if (isWhitelisted(u)) {
            let headers = Object.assign({}, details.requestHeaders);

            // get authentication
            let auth = getAuthentication(u);

            if(auth !== undefined) {
                if (auth === false) {
                    // no authentication required

                    callback({ cancel: false, requestHeaders: headers });
                } else {
                    // inject authentication into headers
                    headers['Authorization'] = 'Basic ' + new Buffer(auth).toString('base64')
                    callback({ cancel: false, requestHeaders: headers })
                }
            } else {
                log.error('No authentication retrieved!');
                callback({ cancel: true });
            }

        } else {
            log.error('Not whitelisted: ' + u);
            callback({ cancel: true });
        }
    });
}


exports.reloadConfig = function(_options) {
  OPTIONS = _options;
  whitelist.clear();
  loadDev();
  loadMarketAuthentication();
  loadWalletAuthentication();
  loadGithub();
}

function isWhitelisted(url) {
    let isValid = whitelist.has(url);
    if (!isValid && url.split(':')[0] === 'localhost') {
      isValid = whitelist.has('localhost:*') && whitelist.get('localhost:*').name === 'market';
    }
    return isValid;
}

// Get the right authentication for the right hostname
// e.g market vs rpc
function getAuthentication(url) {
  let entry = whitelist.get(url);
  if (isPlainObject(entry)) {
    if ('auth' in entry && entry.name === 'wallet' && !entry.auth) {
      // cookie might not be grabbed just yet, so try again..
      loadWalletAuthentication();
    }
    return entry.auth;
  } else if (url.split(':')[0] === 'localhost'){
    entry = whitelist.get('localhost:*');
    if (isPlainObject(entry) && entry.name === 'market') {
      return entry.auth;
    }
  }
}

function loadMarketAuthentication() {
    // let key = "dev1.particl.xyz:";
    let key = "localhost:*";
    let value = {
        name: "market",
        auth: "test:test"
    }

    whitelist.set(key, value);
}

function loadWalletAuthentication() {
    let key = (OPTIONS.rpcbind || 'localhost') + ":" + OPTIONS.port;
    console.log('adding key=' + key);
    let value = {
        name: "wallet",
        auth: cookie.getAuth(OPTIONS)
    }

    whitelist.set(key, value);
}

function loadDev() {
  if (OPTIONS.dev === true) {
    let key = 'localhost:4200';
    let value = {
        name: "dev",
        auth: false
    }

    whitelist.set(key, value);
  }
}

function loadGithub() {
    let key = "api.github.com:80";
    let value = {
        name: "github update service",
        auth: false
    }

    whitelist.set(key, value);
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
