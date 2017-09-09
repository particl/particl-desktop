const _ = require('lodash');
const Q = require('bluebird');
const fs = require('fs');
const { app, dialog } = require('electron');
const got = require('got');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const spawn = require('child_process').spawn;

const ClientBinaryManager = require('./clientBinariesManager').Manager;
const auth = require('../rpc/rpc').getCookie();

const log = {
  info: console.log,
  warn: console.log,
  debug: console.log,
  error: console.log
};

let options;

// should be 'https://raw.githubusercontent.com/particl/partgui/master/modules/clientBinaries/clientBinaries.json';
const BINARY_URL = 'https://raw.githubusercontent.com/particl/partgui/master/modules/clientBinaries/clientBinaries.json';

//const ALLOWED_DOWNLOAD_URLS_REGEX = new RegExp('*', 'i');

class Manager extends EventEmitter {
  constructor() {
    super();
    this._availableClients = {};
  }

  init(restart, _options) {
    log.info('Initializing...');
    options = _options;
    // check every hour
    setInterval(() => this._checkForNewConfig(true), 1000 * 60 * 60);
    this._resolveBinPath();
    return this._checkForNewConfig(restart);
  }

  /*
  ** Checks if particld is already running, starts it in case not running.
  ** returns the daemon's process to be killed when application exits
  ** or undefined if the daemon was not launched
  */
  startDaemon() {

    function launchDaemon(daemon, args) {
      // remove particl-cli specific arguments: (user, pass, command getinfo)
      args.length = 4;
      const child = spawn(daemon, args.filter(arg => arg !== '')).on('close', code => {
        if (code !== 0) {
          log.error(`daemon exited with code ${code}.\n${daemon}\n${args}`);
        } else {
          log.info('daemon exited successfully');
        }
      });
      return (child);
    }

    return new Promise((resolve, reject) => {

      const daemon = options.customdaemon
        ? options.customdaemon
        : this._availableClients['particld'].binPath;

      let args = [
        // common args (particld and particl-cli)
        `${options.testnet ? '-testnet' : ''}`,
        `${options.reindex ? '-reindex' : ''}`,
        `-rpccorsdomain=${options.rpccorsdomain}`,
        `-rpcport=${options.port}`,
        // particl-cli args
        `-rpcuser=${options.rpcuser ? options.rpcuser : auth[0]}`,
        `-rpcpassword=${options.rpcpassword ? options.rpcpassword : auth[1]}`,
        `getinfo`
      ];

      // resolve path of particl-cli
      new Promise((resolveCliPath, noCli) => {
        // particl-cli path from the downloaded archive
        let cliPath = path.join(
          path.dirname(this._availableClients['particld'].binPath),
          `particl-${this._availableClients['particld'].version}`,
          'bin',
          'particl-cli'
        );

        if (!fs.existsSync(cliPath)) {
          // particl-cli was not automatically downloaded, let's find it
          const find = process.platform === 'win32' ? 'where' : 'which';
          spawn(find, 'particl-cli').on('close', code => {
            cliPath = code === 0 ? 'particl-cli' : undefined;
            if (code === 0) {
              // particl-cli was globally installed
              resolveCliPath('particl-cli');
            } else {
              // particl-cli not found
              noCli();
            }
          })
        } else {
          // particl-cli was at the expected path
          resolveCliPath(cliPath);
        }
      }).then((cliPath) => {
        // spawn particl-cli getinfo to know if daemon is already running
        spawn(cliPath, args.filter(arg => arg !== '')).on('close', code => {
          if (code === 0) {
            log.info("daemon already launched");
            resolve(undefined);
          } else {
            log.info("launching daemon");
            resolve(launchDaemon(daemon, args));
          }
        });
      }).catch(() => {
        log.warn('particl-cli was not found. Launching the daemon anyway.')
        resolve(launchDaemon(daemon, args));
      });
    });
  }

  getClient(clientId) {
    return this._availableClients[clientId.toLowerCase()];
  }

  _writeLocalConfig(json) {
    log.info('Write new client binaries local config to disk ...');

    fs.writeFileSync(
      path.join(app.getPath('userData'), 'clientBinaries.json'),
      JSON.stringify(json, null, 2)
    );
  }

  _checkForNewConfig(restart) {
    const nodeType = 'particld';
    let binariesDownloaded = false;
    let nodeInfo;

    log.info(`Checking for new client binaries config from: ${BINARY_URL}`);

    this._emit('loadConfig', 'Fetching remote client config');

    // fetch config
    return got(BINARY_URL, {
      timeout: 3000,
      json: true
    })
    .then((res) => {
      if (!res || _.isEmpty(res.body)) {
        throw new Error('Invalid fetch result');
      } else {
        return res.body;
      }
    })
    .catch((err) => {
      log.warn('Error fetching client binaries config from repo', err);
    })
    .then((latestConfig) => {

      if (!latestConfig) {
        return ;
      }

      let localConfig;
      let skipedVersion;
      const nodeVersion = latestConfig.clients[nodeType].version;

      this._emit('loadConfig', 'Fetching local config');

      // load the local json
      try {
        localConfig = JSON.parse(
          fs.readFileSync(path.join(app.getPath('userData'), 'clientBinaries.json')).toString()
        );
      } catch (err) {
        log.warn(`Error loading local config - assuming this is a first run: ${err}`);

        if (latestConfig) {
          localConfig = latestConfig;

          this._writeLocalConfig(localConfig);
        } else {
          throw new Error('Unable to load local or remote config, cannot proceed!');
        }
      }

      try {
        skipedVersion = fs.readFileSync(path.join(app.getPath('userData'), 'skippedNodeVersion.json')).toString();
      } catch (err) {
        log.info('No "skippedNodeVersion.json" found.');
      }

      // prepare node info
      const platform = process.platform
        .replace('darwin', 'mac')
        .replace('win32', 'win')
        .replace('freebsd', 'linux')
        .replace('sunos', 'linux');
      const binaryVersion = latestConfig.clients[nodeType].platforms[platform][process.arch];
      const checksums = _.pick(binaryVersion.download, 'sha256', 'md5');
      const algorithm = _.keys(checksums)[0].toUpperCase();
      const hash = _.values(checksums)[0];

      // get the node data, to be able to pass it to a possible error
      nodeInfo = {
        type: nodeType,
        version: nodeVersion,
        checksum: hash,
        algorithm
      };

      // if new config version available then ask user if they wish to update
      if (latestConfig
        && JSON.stringify(localConfig) !== JSON.stringify(latestConfig)
        && nodeVersion !== skipedVersion) {

        return new Q((resolve) => {

          log.debug('New client binaries config found, asking user if they wish to update...');

          log.debug('skipping ask user because Electron is not yet linked for that');
          this._writeLocalConfig(latestConfig);
          resolve(latestConfig);

          // const wnd = Windows.createPopup('clientUpdateAvailable', _.extend({
          //   useWeb3: false,
          //   electronOptions: {
          //     width: 600,
          //     height: 340,
          //     alwaysOnTop: false,
          //     resizable: false,
          //     maximizable: false
          //   }
          // }, {
          //   sendData: {
          //     uiAction_sendData: {
          //       name: nodeType,
          //       version: nodeVersion,
          //       checksum: `${algorithm}: ${hash}`,
          //       downloadUrl: binaryVersion.download.url,
          //       restart
          //     }
          //   }
          // }), (update) => {
          //   // update
          //   if (update === 'update') {
          //     this._writeLocalConfig(latestConfig);
          //
          //     resolve(latestConfig);
          //
          //     // skip
          //   } else if (update === 'skip') {
          //     fs.writeFileSync(
          //       path.join(app.getPath('userData'), 'skippedNodeVersion.json'),
          //       nodeVersion
          //     );
          //
          //     resolve(localConfig);
          //   }
          //
          //   wnd.close();
          // });
          //
          // // if the window is closed, simply continue and as again next time
          // wnd.on('close', () => {
          //   resolve(localConfig);
          // });
        });
      }

      return localConfig;
    })
    .then((localConfig) => {

      if (!localConfig) {
        log.info('No config for the ClientBinaryManager could be loaded, using local clientBinaries.json.');

        const localConfigPath = path.join(app.getPath('userData'), 'clientBinaries.json');
        localConfig = (fs.existsSync(localConfigPath))
          ? require(localConfigPath)
          : require('./clientBinaries.json');
      }

      // scan for node
      const mgr = new ClientBinaryManager(localConfig);
      mgr.logger = log;

      this._emit('scanning', 'Scanning for binaries');

      return mgr.init({
        folders: [ path.join(app.getPath('userData'), 'particld', 'unpacked') ]
      })
      .then(() => {
        const clients = mgr.clients;

        this._availableClients = {};

        const available = _.filter(clients, c => !!c.state.available);

        if (!available.length) {
          if (_.isEmpty(clients)) {
            throw new Error('No client binaries available for this system!');
          }

          this._emit('downloading', 'Downloading binaries');

          return Q.map(_.values(clients), (c) => {
            binariesDownloaded = true;

            return mgr.download(c.id, {
              downloadFolder: path.join(app.getPath('userData'))
              //urlRegex: ALLOWED_DOWNLOAD_URLS_REGEX,
            });
          });
        }
      })
      .then(() => {

        this._emit('filtering', 'Filtering available clients');

        _.each(mgr.clients, (client) => {
          if (client.state.available) {
            const idlcase = client.id.toLowerCase();

            this._availableClients[idlcase] = {
              binPath: client.activeCli.fullPath,
              version: client.version
            };
          }
        });

        // restart if it downloaded while running
        if (restart && binariesDownloaded) {
          log.info('Restarting app ...');
          app.relaunch();
          app.quit();
        }

        this._emit('done');

        return this.startDaemon();
      });
    })
    .catch((err) => {
      log.error(err);

      this._emit('error', err.message);

      // show error
      if (err.message.indexOf('Hash mismatch') !== -1) {
        // show hash mismatch error
        dialog.showMessageBox({
          type: 'warning',
          buttons: ['OK'],
          message: global.i18n.t('mist.errors.nodeChecksumMismatch.title'),
          detail: global.i18n.t('mist.errors.nodeChecksumMismatch.description', {
            type: nodeInfo.type,
            version: nodeInfo.version,
            algorithm: nodeInfo.algorithm,
            hash: nodeInfo.checksum
          })
        }, () => {
          app.quit();
        });

        // throw so the main.js can catch it
        throw err;
      }
    });
  }


  _emit(status, msg) {
    log.debug(`Status: ${status} - ${msg}`);

    this.emit('status', status, msg);
  }


  _resolveBinPath() {
    log.info('Resolving path to client binary ...');

    let platform = process.platform;

    // "win32" -> "win" (because nodes are bundled by electron-builder)
    if (platform.indexOf('win') === 0) {
      platform = 'win';
    } else if (platform.indexOf('darwin') === 0) {
      platform = 'mac';
    }

    log.debug(`Platform: ${platform}`);

    let binPath = path.join(app.getPath('userData'), 'particld', 'unpacked', 'particld');

    if (platform === 'win') {
      binPath += '.exe';
    }

    log.info(`Client binary path: ${binPath}`);

    this._availableClients.particld = {
      binPath
    };
  }
}

module.exports = new Manager();
