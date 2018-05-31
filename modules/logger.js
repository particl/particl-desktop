const log     = require('electron-log');
const options = require('./options.js').get();

exports.init = function () {

  log.transports.console.level = 'info';
  log.transports.file.level    = 'debug';

  log.transports.file.appName = process.platform == 'linux'
    ? 'particl-desktop'
    : 'Particl Desktop';
  let logPath = options.testnet
    ? 'particl-desktop-testnet.log'
    : 'particl-desktop.log';
  log.transports.file.file = log.transports.file
    .findLogPath(log.transports.file.appName)
    .replace('log.log', logPath);

  switch (options.verbose) {
    case 1:
      log.transports.console.level = 'debug';
      break ;
    case 2:
      log.transports.console.level = 'debug';
      process.argv.push('-printtoconsole');
      break ;
    case 3:
      log.transports.console.level = 'silly';
      process.argv.push('-debug');
      process.argv.push('-printtoconsole');
      break ;
  }

  log.daemon = log.info;

  log.debug(`console log level: ${log.transports.console.level}`);
  log.debug(`file log level: ${log.transports.file.level}`);

  return log;
}
