const log           = require('electron-log');
const _options    = require('../options').get();
const market    = require('particl-marketplace');

// Stores the child process
let child = undefined;

exports.init = function() {

  if (!_options.skipmarket) {
    log.info('market process starting.');
    child = market.start();

    child.on('close', code => {
      log.info('market process ended.');
    });

    child.stdout.on('data', data => console.log(data.toString('utf8')));
    child.stderr.on('data', data => console.log(data.toString('utf8')));
  }
}

exports.stop = function() {
  if (!_options.skipmarket && child) {
    market.stop();
  }
}

// TODO: Export startup function..