const fs          = require('fs');
const os          = require('os');
const path        = require('path');
const log         = require('electron-log');
const options    = require('../options').get();
const removeWalletAuthentication = require('../webrequest/http-auth').removeWalletAuthentication;
/*
** returns Particl config folder
*/
function getDefaultParticlCorePath() {

  let homeDir = os.homedir ? os.homedir() : process.env['HOME'];

  let dir,
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

function getCookieFilePath() {
  let dataDir = options.datadir ? options.datadir : getDefaultParticlCorePath();
  const COOKIE_FILE = dataDir
                    + (options.testnet ? '/testnet' : '')
                    + '/.cookie';
  return COOKIE_FILE;
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
  let dirs = dirPath.split(path.sep);
  let dir = dirs.shift();
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
  const COOKIE_FILE = getCookieFilePath();

  if (checkCookieExists()) {
    auth = fs.readFileSync(COOKIE_FILE, 'utf8').trim();
    console.log('getAuth(): got cookie', auth)
  } else {
    auth = undefined;
    log.debug('could not find cookie file! path:', COOKIE_FILE);
  }

  return (auth)
}

/*
** Removes the .cookie file.
** (only do this if the daemon isn't running)
*/
function clearCookieFile() {
  const COOKIE_FILE = getCookieFilePath();

  // remove cookie file
  if (checkCookieExists()) {
    fs.unlinkSync(COOKIE_FILE);
  }

  removeWalletAuthentication();

}

/*
** Checks if the .cookie file exists.
*/
function checkCookieExists() {
  let f = getCookieFilePath();
  return fs.existsSync(f)
}


exports.getAuth = getAuth;
exports.checkCookieExists = checkCookieExists;
exports.clearCookieFile = clearCookieFile;