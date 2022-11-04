const { Observable } = require('rxjs');
const _electronStore  = require('electron-store');
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
        },
        address: {
          type: 'string'
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
            default: 1
          },
          default_ringct_size: {
            type: 'integer',
            default: 12
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
}

exports.destroy = () => {
  stateRef = undefined;
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
  }
};
