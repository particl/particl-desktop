const fs          = require('fs');
const ini         = require('ini');
const cookie      = require('../rpc/cookie');
const _options    = require('../options');

const conFilePath = cookie.getParticlConfPath(_options.get())+'/particl.conf';

// Save the config for network stuffs
exports.saveFile = function(networkOpt) {
  fs.writeFileSync(conFilePath, ini.stringify(networkOpt));
}
