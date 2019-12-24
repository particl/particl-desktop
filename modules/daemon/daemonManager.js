const { app } = require('electron');
const EventEmitter    = require('events').EventEmitter;

const _    = require('lodash');
const Q    = require('bluebird');
const fs   = require('fs');
const got  = require('got');
const path = require('path');
const log  = require('electron-log');
const branch = require('../../package.json').branch;

const ClientBinariesManager = require('../clientBinaries/clientBinariesManager').Manager;

// master
// const BINARY_URL = 'https://raw.githubusercontent.com/particl/particl-desktop/master/modules/clientBinaries/clientBinaries.json';

// dev
// const BINARY_URL = 'https://raw.githubusercontent.com/particl/particl-desktop/develop/modules/clientBinaries/clientBinaries.json';
const branchName = (branch || 'develop').replace('-', '/');
const BINARY_URL = `https://raw.githubusercontent.com/particl/particl-desktop/${branchName}/modules/clientBinaries/clientBinaries.json`;

//const ALLOWED_DOWNLOAD_URLS_REGEX = new RegExp('*', 'i');

class DaemonManager extends EventEmitter {
  constructor() {
    super();
    this._availableClients = {};
    this.isTestnet = false;
    this.localPath = app.getPath('userData');
  }

  getPath() {
    return this._availableClients['particld'].binPath;
  }

  init() {
    log.info('Particl Daemon Manager initializing...');

    this._resolveBinPath();
    this._checkForNewConfig();
  }

  shutdown() {
    this.emit('close');
  }

  getClient(clientId) {
    return this._availableClients[clientId.toLowerCase()];
  }

  _writeLocalConfig(json) {
    log.info('Write new client binaries local config to disk ...');

    fs.writeFileSync(
      path.join(this.localPath, 'clientBinaries.json'),
      JSON.stringify(json, null, 2)
    );
  }

  async _checkForNewConfig() {
    const nodeType = 'particld';

    log.info(`Checking for new client binaries config from: ${BINARY_URL}`);

    this._emit('loadConfig', 'Looking remotely for Particl Core version updates...');

    const request = got(BINARY_URL, {
      timeout: 30000,
      json: true
    });

    this.on('close', () => {
      request.cancel();
    });

    // fetch config
    return request.then((res) => {
      if (!res || _.isEmpty(res.body)) {
        throw new Error('Invalid fetch result');
      } else {
        return res.body;
      }
    })
    .catch((err) => {
      if (request.isCanceled || (err instanceof got.CancelError)) {
        const errMsg = 'Failed to fetch client binary info: request cancelled'
        log.warn(errMsg);
        throw new Error (errMsg);
      } else {
        this._emit('error', err.message);
        log.warn('Error fetching client binaries config from repo', err);
      }
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
          fs.readFileSync(path.join(this.localPath, 'clientBinaries.json')).toString()
        );
      } catch (err) {
        log.warn(`Error loading local config - assuming this is a first run: ${err}`);

        if (latestConfig) {
          localConfig = latestConfig;

          this._writeLocalConfig(localConfig);
        } else {
          throw new Error('Unable to load local or remote config: unknown particl core, cannot proceed!');
        }
      }

      try {
        skipedVersion = fs.readFileSync(path.join(this.localPath, 'skippedNodeVersion.json')).toString();
      } catch (err) {
        log.info('No "skippedNodeVersion.json" found.');
      }

      // new config version available: update
      if (latestConfig
        && JSON.stringify(localConfig) !== JSON.stringify(latestConfig)
        && nodeVersion !== skipedVersion) {

        return new Q((resolve) => {

          log.info('New client binaries config found, updating binary...');
          this._writeLocalConfig(latestConfig);
          resolve(latestConfig);
        });
      }

      return localConfig;
    })
    .then((localConfig) => {

      if (!localConfig) {
        log.info('No config for the ClientBinariesManager could be loaded, using local clientBinaries.json.');
        const localConfigPath = path.join(this.localPath, 'clientBinaries.json');
        localConfig = (fs.existsSync(localConfigPath))
          ? require(localConfigPath)
          : require('../clientBinaries/clientBinaries.json');
      }

      // scan for node
      const mgr = new ClientBinariesManager(localConfig);
      mgr.logger = log;

      this._emit('scanning', 'Scanning for binaries');

      return mgr.init({
        folders: [ path.join(this.localPath, 'particld', 'unpacked') ]
      })
      .then(() => {
        const clients = mgr.clients;

        this._availableClients = {};

        const available = _.filter(clients, c => !!c.state.available);

        this.on('close', () => {
          mgr.shutdown();
        });

        if (!available.length) {
          if (_.isEmpty(clients)) {
            throw new Error('No client binaries available for this system!');
          }

          this._emit('downloading', 'Downloading binaries');

          mgr.on('download', (status) => {
            this._emit('download', status);
          });

          return Q.map(_.values(clients), (c) => {

            return mgr.download(c.id, {
              downloadFolder: this.localPath
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

        this._emit('done');

      });
    })
    .catch((err) => {
      log.error(err);

      const errMessage = err.message ? err.message : String(err);

      this._emit('error', errMessage);
    });
  }

    // TODO: emit to GUI

  _emit(status, msg) {
    log.debug(`Status: ${status} - ${_.isPlainObject(msg) ? JSON.stringify(msg) : msg}`);
    this.emit('status', status, msg);
  }


  _resolveBinPath() {
    log.debug('Resolving path to client binary ...');

    let platform = process.platform;

    // "win32" -> "win" (because nodes are bundled by electron-builder)
    if (platform.indexOf('win') === 0) {
      platform = 'win';
    } else if (platform.indexOf('darwin') === 0) {
      platform = 'mac';
    }

    log.debug(`Platform: ${platform}`);

    let binPath = path.join(this.localPath, 'particld', 'unpacked', 'particld');

    if (platform === 'win') {
      binPath += '.exe';
    }

    log.debug(`Client binary path: ${binPath}`);

    this._availableClients.particld = {
      binPath
    };
  }
}

module.exports = new DaemonManager();
