"use strict";

const got  = require('got'),
         _ = require('lodash'),
        fs = require('fs'),
    crypto = require('crypto'),
      path = require('path'),
    mkdirp = require('mkdirp'),
     unzip = require('node-unzip-2'),
     spawn = require('buffered-spawn'),
       log = require('electron-log'),
  progress = require('cli-progress'),
  EventEmitter = require('events').EventEmitter;


function copyFile(src, dst) {
  return new Promise((resolve, reject) => {
    var rd = fs.createReadStream(src);

    rd.on("error", (err) => {
      reject(err);
    });

    var wr = fs.createWriteStream(dst);
    wr.on("error", (err) => {
      reject(err);
    });
    wr.on("close", (ex) => {
      resolve();
    });

    rd.pipe(wr);
  });
}

function checksum(filePath, algorithm) {
  return new Promise((resolve, reject) => {
    const checksum = crypto.createHash(algorithm);

    const stream = fs.ReadStream(filePath);

    stream.on('data', (d) => checksum.update(d));

    stream.on('end', () => {
      resolve(checksum.digest('hex'));
    });

    stream.on('error', reject);
  });
}

class Manager extends EventEmitter {
  /**
   * Construct a new instance.
   *
   * @param {Object} [config] The configuraton to use. If ommitted then the
   * default configuration (`DefaultConfig`) will be used.
   */
  constructor (config) {
    super();
    this._config = config;

    this._logger = log;
  }

  /**
   * Get configuration.
   * @return {Object}
   */
  get config () {
    return this._config;
  }

  /**
   * Get info on available clients.
   *
   * This will return an object, each item having the structure:
   *
   * "client name": {
   *  id: "client name"
   *  homepage: "client homepage url"
   *  version: "client version"
   *  versionNotes: "client version notes url"
   *  cli: {... info on all available platforms...},
   *  activeCli: {
   *    ...info for this platform...
   *  }
   *  status: {
        "available": true OR false (depending on status)
        "failReason": why it is not available (`sanityCheckFail`, `notFound`, etc)
   *  }
   * }
   *
   * @return {Object}
   */
  get clients () {
    return this._clients;
  }

  /**
   * Initialize the manager.
   *
   * This will scan for clients.
   * Upon completion `this.clients` will have all the info you need.
   *
   * @param {Object} [options] Additional options.
   * @param {Array} [options.folders] Additional folders to search in for client binaries.
   *
   * @return {Promise}
   */
  init(options) {
    this._logger.debug('Initializing Manager...');

    this._resolvePlatform();

    return this._scan(options);
  }

  /**
   * Download a particular client.
   *
   * If client supports this platform then
   * it will be downloaded from the download URL, whether it is already available
   * on the system or not.
   *
   * If client doesn't support this platform then the promise will be rejected.
   *
   * Upon completion the `clients` property will have been updated with the new
   * availability status of this client. In addition the following info will
   * be returned from the promise:
   *
   * ```
   * {
   *   downloadFolder: ...where archive got downloaded...
   *   downloadFile: ...location of downloaded file...
   *   unpackFolder: ...where archive was unpacked to...
   *   client: ...updated client object (contains availability info and full binary path)...
   * }
   * ```
   *
   * @param {Object} [options] Options.
   * @param {Object} [options.downloadFolder] Folder to download client to, and to unzip it in.
   * @param {Function} [options.unpackHandler] Custom download archive unpack handling function.
   * @param {RegExp} [options.urlRegex] Regex to check the download URL against (this is a security measure).
   *
   * @return {Promise}
   */
  download (clientId, options) {
    options = Object.assign({
      downloadFolder: null,
      unpackHandler: null,
      urlRegex: null
    }, options);

    this._logger.info(`Download binary for ${clientId} ...`);

    const client = _.get(this._clients, clientId);

    const activeCli = _.get(client, `activeCli`),
      downloadCfg = _.get(activeCli, `download`);

    return Promise.resolve()
    .then(() => {
      // not for this machine?
      if (!client) {
        throw new Error(`${clientId} missing configuration for this platform.`);
      }

      if (!_.get(downloadCfg, 'url') || !_.get(downloadCfg, 'type')) {
        throw new Error(`Download info not available for ${clientId}`);
      }

      if (options.urlRegex) {
        this._logger.debug('Checking download URL against regex ...');

        if (!options.urlRegex.test(downloadCfg.url)) {
          throw new Error(`Download URL failed regex check`);
        }
      }

      let resolve, reject;
      const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });

      this._logger.debug('Generating download folder path ...');

      const downloadFolder = path.join(
        options.downloadFolder,
        client.id
      );

      this._logger.debug(`Ensure download folder ${downloadFolder} exists ...`);

      mkdirp.sync(downloadFolder);

      const downloadFile = path.join(downloadFolder, `archive.${downloadCfg.type}`);

      this._logger.debug(`Downloading package from ${downloadCfg.url} to ${downloadFile} ...`);

      const writeStream = fs.createWriteStream(downloadFile);

      const stream = got.stream(downloadCfg.url);
      let progressBar = undefined;

      stream.pipe(writeStream);

      stream.on('downloadProgress', (info) => {
        if (progressBar) {
          progressBar.update(info.transferred);

          this.emit('download', {
            status: 'busy',
            transferred: info.transferred,
            total: info.total
          });

        } else {
          progressBar = new progress.Bar({}, progress.Presets.shades_classic);
          progressBar.start(info.total, info.transferred);

          this.emit('download', {
            status: 'started',
            transferred: info.transferred,
            total: info.total
          });

        }
      });

      stream.on('error', (err) => {
        if (progressBar) {
          progressBar.stop();

          this.emit('download', {
            status: 'error'
          });
        }
        this._logger.error(err);
        reject(new Error(`Error downloading package for ${clientId}: ${err.message}`));
      });

      stream.on('end', () => {
        if (progressBar) {
          progressBar.stop();

          this.emit('download', {
            status: 'done'
          });
        }
        this._logger.debug(`Downloaded ${downloadCfg.url} to ${downloadFile}`);
        try {
          fs.accessSync(downloadFile, fs.F_OK | fs.R_OK);
          resolve({
            downloadFolder: downloadFolder,
            downloadFile: downloadFile
          });
        } catch (err) {
          reject(new Error(`Error downloading package for ${clientId}: ${err.message}`));
        }
      });

      return promise;
    })
    .then((dInfo) => {
      const downloadFolder = dInfo.downloadFolder,
        downloadFile = dInfo.downloadFile;

      // test checksum
      let value, algorithm, expectedHash;

      if ((value = _.get(downloadCfg, 'md5'))) {
          expectedHash = value;
          algorithm = 'md5';
      } else if ((value = _.get(downloadCfg, 'sha256'))) {
          expectedHash = value;
          algorithm = 'sha256';
      }

      if (algorithm) {
        return checksum(dInfo.downloadFile, algorithm)
          .then((hash) => {
              this._logger.silly('algorithm: ', algorithm);
              this._logger.silly('file hash: ', hash);
              this._logger.silly('expected: ', expectedHash);
            if (expectedHash !== hash) {
              throw new Error(`Hash mismatch: ${expectedHash}`);
            }
            return dInfo;
          });
      } else {
        return dInfo;
      }
    })
    .then((dInfo) => {
      const downloadFolder = dInfo.downloadFolder,
        downloadFile = dInfo.downloadFile;

      const unpackFolder = path.join(downloadFolder, 'unpacked');

      this._logger.debug(`Ensure unpack folder ${unpackFolder} exists ...`);

      mkdirp.sync(unpackFolder);

      this._logger.debug(`Unzipping ${downloadFile} to ${unpackFolder} ...`);

      let promise;

      if (options.unpackHandler) {
        this._logger.debug(`Invoking custom unpack handler ...`);
        promise = options.unpackHandler(downloadFile, unpackFolder);
      } else {
        switch (downloadCfg.type) {
          case 'zip':
            this._logger.debug(`Using unzip ...`);

            promise = new Promise((resolve, reject) => {
              try {
                fs.createReadStream(downloadFile)
                  .pipe(
                    unzip.Extract({ path: unpackFolder })
                    .on('close', resolve)
                    .on('error', reject)
                  )
                  .on('error', reject);
              } catch (err) {
                reject(err);
              }
            });
            break;
          case 'tar':
            this._logger.debug(`Using tar ...`);

            promise = this._spawn('tar', ['-xf', downloadFile, '-C', unpackFolder]);
            break;
          default:
            throw new Error(`Unsupported archive type: ${downloadCfg.type}`);
        }
      }

      return promise.then(() => {
        this._logger.debug(`Unzipped ${downloadFile} to ${unpackFolder}`);

        const linkPath = path.join(unpackFolder, activeCli.bin);

        // need to rename binary?
        if (downloadCfg.bin) {
          let realPath = path.join(unpackFolder, downloadCfg.bin);
          try {
            fs.accessSync(linkPath, fs.R_OK);
            fs.unlinkSync(linkPath);
          } catch (e) {
            if (e.code !== 'ENOENT')
              this._logger.warn(e);
          }
          return copyFile(realPath, linkPath).then(() => linkPath);
        } else {
          return Promise.resolve(linkPath);
        }
      })
      .then((binPath) => {
        // make binary executable
        try {
          fs.chmodSync(binPath, '755');
        } catch (e) {
          this._logger.warn(e);
        }

        return {
          downloadFolder: downloadFolder,
          downloadFile: downloadFile,
          unpackFolder: unpackFolder
        };
      });
    })
    .then((info) => {
      return this._verifyClientStatus(client, {
        folders: [info.unpackFolder]
      })
      .then(() => {
        info.client = client;
        return info;
      });
    });
  }

  _resolvePlatform () {
    this._logger.debug('Resolving platform...');

    // platform
    switch (process.platform) {
      case 'win32':
        this._os = 'win';
        break;
      case 'darwin':
        this._os = 'mac';
        break;
      default:
        this._os = process.platform;
    }

    // architecture
    this._arch = process.arch;

    return Promise.resolve();
  }

  /**
   * Scan the local machine for client software, as defined in the configuration.
   *
   * Upon completion `this._clients` will be set.
   *
   * @param {Object} [options] Additional options.
   * @param {Array} [options.folders] Additional folders to search in for client binaries.
   *
   * @return {Promise}
   */
  _scan (options) {
    this._clients = {};

    return this._calculatePossibleClients()
    .then((clients) => {
      this._clients = clients;

      const count = Object.keys(this._clients).length;

      this._logger.debug(`${count} possible clients.`);

      if (_.isEmpty(this._clients)) {
        return;
      }

      this._logger.debug(`Verifying status of all ${count} possible clients...`);

      return Promise.all(_.values(this._clients).map(
        (client) => this._verifyClientStatus(client, options)
      ));
    });
  }

  /**
   * Calculate possible clients for this machine by searching for binaries.
   * @return {Promise}
   */
  _calculatePossibleClients () {
    return Promise.resolve()
    .then(() => {
      // get possible clients
      this._logger.debug('Calculating possible clients...');

      const possibleClients = {};

      for (let clientName in _.get(this._config, 'clients', {})) {
        let client = this._config.clients[clientName];

        if (_.get(client, `platforms.${this._os}.${this._arch}`)) {
          possibleClients[clientName] =
            Object.assign({}, client, {
              id: clientName,
              activeCli: client.platforms[this._os][this._arch]
            });
        }
      }

      return possibleClients;
    });
  }

  /**
   * This will modify the passed-in `client` item according to check results.
   *
   * @param {Object} [options] Additional options.
   * @param {Array} [options.folders] Additional folders to search in for client binaries.
   *
   * @return {Promise}
   */
  _verifyClientStatus (client, options) {
    options = Object.assign({
      folders: []
    }, options);

    this._logger.debug(`Verify ${client.id} status ...`);

    return Promise.resolve().then(() => {
      const binName = client.activeCli.bin;

      // reset state
      client.state = {};
      delete client.activeCli.binPath;

      this._logger.debug(`${client.id} binary name: ${binName}`);

      const binPaths = [];
      let command;
      let args = [];

      if (process.platform === 'win32') {
          command = 'where';
      } else {
          command = 'which';
      }
      args.push(binName);

      return this._spawn(command, args)
      .then((output) => {
        const systemPath = _.get(output, 'stdout', '').trim();

        if (_.get(systemPath, 'length')) {
          this._logger.debug(`Got PATH binary for ${client.id}: ${systemPath}`);

          binPaths.push(systemPath);
        }
      }, (err) => {
        this._logger.debug(`Command ${binName} not found in path.`);
      })
      .then(() => {
        // now let's search additional folders
        if (_.get(options, 'folders.length')) {
          options.folders.forEach((folder) => {
            this._logger.debug(`Checking for ${client.id} binary in ${folder} ...`);

            const fullPath = path.join(folder, binName);

            try {
              fs.accessSync(fullPath, fs.F_OK | fs.X_OK);

              this._logger.debug(`Got optional folder binary for ${client.id}: ${fullPath}`);

              binPaths.push(fullPath);
            } catch (err) {
              /* do nothing */
            }
          });
        }
      })
      .then(() => {
        if (!binPaths.length) {
          throw new Error(`No binaries found for ${client.id}`);
        }
      })
      .catch((err) => {
        this._logger.error(`Unable to resolve ${client.id} executable: ${binName}`);

        client.state.available = false;
        client.state.failReason = 'notFound';

        throw err;
      })
      .then(() => {
        // sanity check each available binary until a good one is found
        return Promise.all(binPaths.map((binPath) => {
          this._logger.debug(`Running ${client.id} sanity check for binary: ${binPath} ...`);

          return this._runSanityCheck(client, binPath)
          .catch((err) => {
            this._logger.debug(`Sanity check failed for: ${binPath}`);
          });
        }))
        .then(() => {
          // if one succeeded then we're good
          if (client.activeCli.fullPath) {
            return;
          }

          client.state.available = false;
          client.state.failReason = 'sanityCheckFail';

          throw new Error('All sanity checks failed');
        });
      })
      .then(() => {
        client.state.available = true;
      })
      .catch((err) => {
        this._logger.debug(`${client.id} deemed unavailable`);

        client.state.available = false;
      })
    });
  }

  /**
   * Run sanity check for client.

   * @param {Object} client Client config info.
   * @param {String} binPath Path to binary (to sanity-check).
   *
   * @return {Promise}
   */
  _runSanityCheck (client, binPath) {
    this._logger.debug(`${client.id} binary path: ${binPath}`);

    this._logger.debug(`Checking for ${client.id} sanity check ...`);

    const sanityCheck = _.get(client, 'activeCli.commands.sanity');

    return Promise.resolve()
    .then(() => {
      if (!sanityCheck) {
        throw new Error(`No ${client.id} sanity check found.`);
      }
    })
    .then(() => {
      this._logger.debug(`Checking sanity for ${client.id} ...`)

      return this._spawn(binPath, sanityCheck.args);
    })
    .then((output) => {
      const haystack = output.stdout + output.stderr;

      this._logger.debug(`Sanity check output: ${haystack}`);

      const needles = sanityCheck.output || [];

      for (let needle of needles) {
        if (0 > haystack.indexOf(needle)) {
          throw new Error(`Unable to find "${needle}" in ${client.id} output`);
        }
      }

      this._logger.info(`Sanity check passed for ${binPath}`);

      // set it!
      client.activeCli.fullPath = binPath;
    })
    .catch((err) => {
      this._logger.error(`Sanity check failed for ${client.id}`, err);

      throw err;
    });
  }

  /**
   * @return {Promise} Resolves to { stdout, stderr } object
   */
  _spawn(cmd, args) {
    args = args || [];

    this._logger.debug(`Exec: "${cmd} ${args.join(' ')}"`);

    return spawn(cmd, args);
  }
}

exports.Manager = Manager;
