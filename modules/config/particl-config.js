const fs = require('fs');
const ini = require('ini');
let config;

// Read the config for network stuffs
function readFile() {
  config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
}

// Save the config for network stuffs
exports.saveFile = function(networkOpt) {
  fs.writeFileSync('./config.ini', ini.stringify(networkOpt));
}

// todo: test
exports.destroy = function() {
  rxIpc.removeListeners('network-config');
}

export._getNetwork = function() {
  return config
}