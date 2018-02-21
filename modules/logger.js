const log = require('electron-log');
const testnet = require('./options.js').get()['testnet'];

exports.init = function () {

  log.transports.console.level = 'info';
  log.transports.file.level    = 'debug';

  log.transports.file.appName = process.platform == 'linux'
    ? 'particl-desktop'
    : 'Particl Desktop';
  let logPath = testnet ? 'testnet/particl-desktop.log' : 'particl-desktop.log';
  log.transports.file.file = log.transports.file
    .findLogPath(log.transports.file.appName)
    .replace('log.log', logPath);

  console.log(log.transports.file.file);

  if (process.argv.includes('-v')) {
    log.transports.console.level = 'debug';
    process.argv.splice(process.argv.indexOf('-v'), 1);

  } else if (process.argv.includes('-vv')) {
    log.transports.console.level = 'debug';
    process.argv.push('-printtoconsole');
    process.argv.splice(process.argv.indexOf('-vv'), 1);

  } else if (process.argv.includes('-vvv')) {
    log.transports.console.level = 'silly';
    process.argv.push('-debug');
    process.argv.push('-printtoconsole');
    process.argv.splice(process.argv.indexOf('-vvv'), 1);
  }

  log.daemon = log.info;

  log.debug(`console log level: ${log.transports.console.level}`);
  log.debug(`file log level: ${log.transports.file.level}`);

  return log;
}
