const log = require('electron-log');

exports.init = function () {

  log.transports.console.level = 'info';
  log.transports.file.level    = 'debug';

  log.transports.file.appName = (process.platform == 'linux' ? '.particl' : 'Particl');
  log.transports.file.file = log.transports.file
    .findLogPath(log.transports.file.appName)
    .replace('log.log', 'particl.log');

  let i;

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
