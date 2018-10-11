const fs          = require('fs');
const ini         = require('ini');
const cookie      = require('../rpc/cookie');
const _options    = require('../options');
let config =  {
  upnp: false,
  proxy: false,
  proxyIP: '127.0.0.1',
  proxyPort: 9050,
}
const conFilePath = cookie.getParticlConfPath(_options.get())+'/particl.conf.ini';

// Read the config for network stuffs
exports.readFile = function() {
  if (fs.existsSync(conFilePath)) {
    return ini.parse(fs.readFileSync(conFilePath, 'utf-8'));
  }
  return config;
}

// Save the config for network stuffs
exports.saveFile = function(networkOpt) {
  fs.writeFileSync(conFilePath, ini.stringify(networkOpt));
}
