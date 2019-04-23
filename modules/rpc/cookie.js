const fs   = require('fs');
const os   = require('os');
const path = require('path');
const log  = require('electron-log');

/*
** returns Particl config folder
*/
function findCookiePath() {

  var homeDir = os.homedir ? os.homedir() : process.env['HOME'];

  var dir,
      appName = 'Particl';
  switch (process.platform) {
    case 'linux': {
      dir = prepareDir(homeDir, '.' + appName.toLowerCase()).result;
      break;
    }

    case 'darwin': {
      dir = prepareDir(homeDir, 'Library', 'Application Support', appName).result;
      break;
    }

    case 'win32': {
      dir = prepareDir(process.env['APPDATA'], appName)
           .or(homeDir, 'AppData', 'Roaming', appName).result;
      break;
    }
  }

  if (dir) {
    return dir;
  } else {
    return false;
  }
}

/*
** directory resolver
*/
function prepareDir(dirPath) {
  // jshint -W040
  if (!this || this.or !== prepareDir || !this.result) {
    // if dirPath couldn't be resolved
    if (!dirPath) {
      // return this function to be chained with .or()
      return { or: prepareDir };
    }

    //noinspection JSCheckFunctionSignatures
    dirPath = path.join.apply(path, arguments);
    mkDir(dirPath);

    try {
      fs.accessSync(dirPath, fs.W_OK);
    } catch (e) {
      // return this function to be chained with .or()
      return { or: prepareDir };
    }
  }

  return {
    or: prepareDir,
    result: (this ? this.result : false) || dirPath
  };
}

/*
** create a directory
*/
function mkDir(dirPath, root) {
  var dirs = dirPath.split(path.sep);
  var dir = dirs.shift();
  root = (root || '') + dir + path.sep;

  try {
    fs.mkdirSync(root);
  } catch (e) {
    if (!fs.statSync(root).isDirectory()) {
      throw new Error(e);
    }
  }

  return !dirs.length || mkDir(dirs.join(path.sep), root);
}

/*
** returns the current RPC cookie
** RPC cookie is regenerated at every particld startup
*/
function getAuth(options) {

  if (options.rpcuser && options.rpcpassword) {
    return options.rpcuser + ':' + options.rpcpassword;
  }

  let auth;
  const COOKIE_PATH = getCookiePath(options);

  if (fs.existsSync(COOKIE_PATH)) {
    auth = fs.readFileSync(COOKIE_PATH, 'utf8').trim();
  } else {
    auth = undefined;
    log.debug('could not find cookie file! path:', COOKIE_PATH);
  }

  return (auth)
}


function clearCookieFilePath(options) {
  let success = true;
  log.info('Checking if cookie file exists (from incorrect shutdown)...');
  const cookiePath = getCookiePath(options);
  try {
    if (fs.existsSync(cookiePath)) {
      fs.unlinkSync(cookiePath);
      log.info('Cleared existing cookie file...');
    }
  } catch (err) {
    if (err && err.code !== 'ENOENT') {
      log.error('Failed to remove existing cookie file!!');
      success = false;
    }
  }
  if (success) {
    log.info('Cookie file check completed successfully');
  }

}

function getParticlPath(options) {
  return options.datadir ? options.datadir : findCookiePath();
}

function getCookieName(options) {
  return options.rpccookiefile ? options.rpccookiefile : `.cookie`;
}

function getCookiePath(options) {
  let dataDir = getParticlPath(options);
  const segments = [dataDir];
  if (options.testnet) {
    segments.push('testnet');
  }
  segments.push(getCookieName(options));
  return path.join(...segments);
}

exports.getAuth = getAuth;
exports.getParticlPath = getParticlPath;
exports.getCookieName = getCookieName;
exports.clearCookieFilePath = clearCookieFilePath;
