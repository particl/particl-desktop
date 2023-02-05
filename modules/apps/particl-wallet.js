const _fs = require('fs');
const { Observable, Subject, from, defer } = require('rxjs');
const { skipWhile, catchError, takeUntil, finalize } = require('rxjs/operators');
const _electronStore  = require('electron-store');
const { rxToStream } = require('rxjs-stream');
const { Transform } = require('json2csv');
const _settingsManager = require('../settingsManager');
const _coreManager = require('../coreManager');


const networkConfigSchema = {
  type: 'object',
  properties: {
    urls: {
      type: 'object',
      properties: {
        transaction: {
          type: 'string',
          pattern: "^((?:http(s)?:\\/\\/)?(\\{txid\\})?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?(\\{txid\\})?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+)?$"
        },
        address: {
          type: 'string',
          pattern: "^((?:http(s)?:\\/\\/)?(\\{addressid\\})?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?(\\{addressid\\})?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+)?$"
        },
      }
    },
    activeWallet: {
      title: 'Active Wallet',
      description: 'The last active wallet loaded.',
      type: 'string',
      default: ''
    },
    wallets: {
      title: 'Wallet specific settings',
      description: 'List of wallets and their related configuration settings.',
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          name: {
              type: 'string',
          },
          notifications_payment_received: {
            type: 'boolean',
            default: false,
          },
          notifications_staking_reward: {
            type: 'boolean',
            default: false,
          },
          utxo_split_count: {
            type: 'integer',
            default: 1,
            minimum: 1,
            maximum: 100
          },
          default_ringct_size: {
            type: 'integer',
            default: 12,
            minimum: 3,
            maximum: 32
          }
        }
      },
    },
  }
};

const SETTING_SCHEMA = {
  main: networkConfigSchema,
  test: networkConfigSchema,
  regtest: networkConfigSchema,
};

let stateRef;
let destroy$ = new Subject();


const getParticlCoreChain = () => {

  const coreSettings = _coreManager.getCoreSettings('particl');
  if (
    (coreSettings !== null) &&
    (Object.prototype.toString.call(coreSettings.startedParams) === '[object Object]') &&
    (typeof coreSettings.startedParams.chain === 'string')
  ) {
      return coreSettings.startedParams.chain;
  }

  return '';
};


class CSVWriter {

  #_targetPath;

  constructor(targetPath) {
    if ((typeof targetPath === 'string') && (targetPath.length > 3) ) {
      this.#_targetPath = targetPath;
    }
  }


  write(data /* Array of JSON objects to be written */) {
    return defer(() => {
      let writeStream;

      return new Observable(obs$ => {
        if (!Array.isArray(data)) {
          obs$.error('INVALID_DATA');
          return;
        }

        writeStream = _fs.createWriteStream(this.#_targetPath, { encoding: 'utf8' });
        const sourceStream = from(data).pipe(
          skipWhile(d => !d || Object.prototype.toString.call(d) !== '[object Object]'),
          catchError(e => destroy$.next()),
          takeUntil(destroy$)
        );
        const json2csv = new Transform({}, {highWaterMark: 16384, encoding: 'utf8', objectMode: true});
        json2csv
          .on('header', header => console.log('EXPORT (OUTPUT HEADER): ', header))
          .on('line', line => console.log('EXPORT (OUTPUT LINE):', line))
          .on('error', err => console.log('EXPORT (ERROR!!):', err));

        writeStream
          .on('error', (err) => {
            obs$.error(err);
          })
          .on('finish', () => {
            obs$.next();
            obs$.complete();
          });

        rxToStream(sourceStream, { objectMode: true }).pipe(json2csv).pipe(writeStream);
      }).pipe(
        finalize(() => {
          if (writeStream && !writeStream.destroyed) {
            writeStream.end();
          }
        }),
        takeUntil(destroy$)
      );
    });
  }

}


exports.init = () => {
  if (!stateRef) {
    stateRef = new _electronStore({
      schema: SETTING_SCHEMA,
      defaults: {
        main: {
          urls: {
            transaction: 'https://explorer.particl.io/tx/{txid}',
            address: 'https://explorer.particl.io/address/{addressid}',
          }
        },
        test: {
          urls: {
            transaction: 'https://explorer-testnet.particl.io/tx/{txid}',
            address: 'https://explorer-testnet.particl.io/address/{addressid}',
          }
        },
      },
      // migrations: migrations,
      name: 'particl-wallets',
      cwd: _settingsManager.getSettings(null, 'PATHS').config,
      fileExtension: 'json',
      clearInvalidConfig: true,
      accessPropertiesByDotNotation: true,
      projectVersion: _settingsManager.getSettings(null, 'VERSIONS').wallet,
    });
  }

  if (!destroy$) {
    destroy$ = new Subject();
  } else {
    // may have been completed already
    try {
      destroy$.next();
    } catch(err) {
      destroy$ = new Subject();
    }
  }
}

exports.destroy = () => {
  stateRef = undefined;
  destroy$.next();
  destroy$.complete();
}


exports.channels = {
  on: {
    'setActiveWallet': (walletName) => {
      if (!stateRef || (typeof walletName !== 'string')) {
        return;
      }

      const currentChain = getParticlCoreChain();
      if (currentChain.length > 0){
        try {
          stateRef.set(`${currentChain}.activeWallet`, walletName);
        } catch (e) {
          // TODO: possibly log out an error here?
        }
      }
    }
  },

  invoke: {
    'wallet-settings': (_, walletName) => {
      return new Observable(observer => {

        if (!stateRef || (typeof walletName !== 'string')) {
          observer.complete();
          return;
        }

        let foundWallet = undefined;

        const currentChain = getParticlCoreChain();
        if (currentChain.length > 0) {
          const walletList = stateRef.get(`${currentChain}.wallets`, []);

          if (Array.isArray(walletList)) {
            foundWallet = walletList.find(w => w.name === walletName);
          }
        }

        observer.next({ wallet: foundWallet || null });
        observer.complete();
      });
    },

    'lastActiveWallet': () => {
      return new Observable(observer => {
        const currentChain = getParticlCoreChain();
        let wallet = null;
        if (stateRef && (currentChain.length > 0)) {
          try {
            wallet = stateRef.get(`${currentChain}.activeWallet`, wallet);
          } catch(_) { }
        }
        observer.next(wallet);
        observer.complete();
      });
    },

    'update-wallet': (_, walletName, setting, value) => {
      return new Observable(observer => {

        let success = false;
        const currentChain = getParticlCoreChain();


        if (!stateRef || (typeof walletName !== 'string' || typeof setting !== 'string') ||  !(currentChain.length > 0)) {
          observer.next(success);
          observer.complete();
          return;
        }

        const wallets = stateRef.get(`${currentChain}.wallets`, []);
        let foundWalletIdx = wallets.findIndex(w => w.name === walletName);

        if (foundWalletIdx === -1) {
          wallets.push({ name: walletName });
          foundWalletIdx = wallets.length - 1;
        }

        wallets[foundWalletIdx][setting] = value;

        try {
          stateRef.set(`${currentChain}.wallets`, wallets);
          success = true;
        } catch(_) { }

        observer.next(success);
        observer.complete();
      });
    },

    'fetchUrls': () => {
      return new Observable(observer => {

        const currentChain = getParticlCoreChain();

        const urlObj = stateRef.get(`${currentChain}.urls`, {});

        observer.next(urlObj);
        observer.complete();
      });
    },

    'updateUrl': (_, url, value) => {
      return new Observable(observer => {

        let success = false;
        const currentChain = getParticlCoreChain();


        if (!stateRef || typeof url !== 'string' || typeof value !== 'string' ||  !(currentChain.length > 0)) {
          observer.next(success);
          observer.complete();
          return;
        }

        try {
          stateRef.set(`${currentChain}.urls.${url}`, value);
          success = true;
        } catch(_) { }

        observer.next(success);
        observer.complete();
      });
    },

    'export-writecsv': (_, targetPath /* string: file/url/path to save data to */, data /* Array of JSON objects */) => {
      return defer(() => (new CSVWriter(targetPath)).write(data));
    },
  }
};
