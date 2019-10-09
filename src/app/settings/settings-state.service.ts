import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { Observable, Observer, BehaviorSubject } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';

import { StateService } from 'app/core/state/state.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService, IWallet } from 'app/multiwallet/multiwallet.service';

enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean'
};

// Where various settings are saved. Adding a new value here likely requires:
//  -> Update start() to extract values
//  -> Update writeValues() to persist the data to the storage means
enum SaveLocation {
  LOCALSTORAGE = 0
};

class Setting {
  private _value: any;
  private _label: string = '';
  constructor(private _location: SaveLocation, private _type: SettingType, private _default: any) {
     if (typeof _default !== _type) {
        this._default = null;
     }
     this._value = this._default;
  }

  set value(val: any) {
    if (typeof val === this._type) {
      this._value = val;
    }
  }
  get value(): any { return this._value; };
  set label(l: string) { this._label = l; };
  get label(): string { return this._label; };
  get location(): SaveLocation { return this._location; };
  get type(): SettingType { return this._type; };
};

interface SettingStructure {
  [key: string]: Setting | SettingStructure
};

interface KeyValue {
  label: string,
  value: any
}

@Injectable()
export class SettingsStateService extends StateService implements OnDestroy {

  private log: any = Log.create('settings-state.service id:' + Math.floor((Math.random() * 1000) + 1));
  private isDestroyed: boolean = false;
  private _isInitialized: boolean = false;
  private _loadedWallet: BehaviorSubject<IWallet> = new BehaviorSubject<IWallet>(null);

  // Keep settings as a reference to the loaded values for validation
  private settings: SettingStructure = {};

  // Define wallet specific settings: prefixed with 'settings.wallet'
  private settingsWallet: SettingStructure = {
    notifications: {
       'payment_received': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
       'staking_reward': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
       'order_updated': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
       'proposal_arrived': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
    } as SettingStructure
  };

  // Define global settings: prefixed with 'settings.global'
  private settingsGlobal: SettingStructure = {
    'selectedWallet': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, ''),
    'fallbackWallet': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, ''),
    'activeWallet': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, '')
  }

  constructor(
    private _rpc: RpcService,
    private _multi: MultiwalletService) {
    super();

    this.log.d('service started');

    new Observable((observer) => {
      this.initializeComponent(observer);
    }).subscribe(
      () => {
        this.start();
      }
    );
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this._loadedWallet.complete();
  }

  get initialized(): boolean {
    return this._isInitialized;
  }

  currentWallet(): Observable<IWallet> {
    return this._loadedWallet
      .asObservable()
      .pipe(
        takeWhile(() => !this.isDestroyed)
      );
  }

  async changeToWallet(name: string) {
    await this.changeWallet(name);
  }

  changeRpcWalletOnly(name: string) {
    this.save({label: 'settings.global.activeWallet', value: name});
    this._rpc.setWalletName(name);
  }

  saveAll(settings: KeyValue[]): string[] {
    const failures: string[] = [];
    // Ensure all settings are actual valid settings
    settings.forEach((setting, idx) => {
      if (!(setting.label in this.settings)) {
        failures.push(setting.label);
      }
    });

    if (failures.length > 0) {
      return failures;
    }

    const settingGroups = {};
    for (const newSetting of settings) {
      const setting = <Setting>this.settings[newSetting.label];
      let isValid = false;

      if (typeof newSetting.value === setting.type) {
        const storageType = setting.location.toString();

        if (!settingGroups[storageType]) {
          settingGroups[storageType] = [];
        }
        isValid = true;
        settingGroups[storageType].push(newSetting);
      }

      if (!isValid) {
        failures.push(newSetting.label);
      }
    }

    if (failures.length > 0) {
      return failures;
    }

    const settingGroupKeys = Object.keys(settingGroups);
    for (const sgKey of settingGroupKeys) {
      this.writeValues(+sgKey, settingGroups[sgKey]);
    }
    return [];
  };

  save(setting: KeyValue): string[] {
    return this.saveAll([setting]);
  };

  private initializeComponent(observer: Observer<any>) {
    if (this.isDestroyed) {
      return;
    }

    if (!this._rpc.enabled || !this._multi.initComplete) {
      setTimeout(this.initializeComponent.bind(this), 1500, observer);
      return;
    }

    observer.next(null);
    observer.complete();
  }

  private async start(): Promise<void> {

    // Extract localStorage settings data
    let localStorageSettings = {};
    try {
      localStorageSettings = JSON.parse(localStorage.getItem('settings') || '{}') || {};
    } catch (_err) {
      // nothing to do
    }
    const globalSettings = localStorageSettings['global'] || {};

    // Set the settings values
    this.initializeSettings('settings.global', this.settingsGlobal, globalSettings);

    // Set the initial wallet
    const allWallets = await this._multi.list.pipe(take(1)).toPromise();
    const allWalletsNames = allWallets.map(w => w.name);

    const fallbackWS = (<Setting>this.settings['settings.global.fallbackWallet']);
    const lastUsedWS = (<Setting>this.settings['settings.global.selectedWallet']);

    let targetWalletName = allWalletsNames[0];
    const fallbackWalletName = allWalletsNames.find((w) => w === fallbackWS.value);
    if (typeof fallbackWalletName === 'string') {
      targetWalletName = fallbackWalletName;
    }

    const lastUsedWalletName = allWalletsNames.find((w) => w === lastUsedWS.value);
    if (lastUsedWalletName) {
      targetWalletName = lastUsedWalletName;
    }

    await this.changeWallet(targetWalletName);

    this._isInitialized = true;
  }

  private async changeWallet(name: string) {
    const allWallets = await this._multi.list.pipe(take(1)).toPromise();
    const foundWallet = allWallets.find((w) => w.name === name);

    if (foundWallet === undefined) {
      return;
    }

    let walletSettings = {};
    try {
      const localStorageSettings = JSON.parse(localStorage.getItem('settings') || '{}') || {};
      const settingsWalletGroup = localStorageSettings.wallets || {};
      const walletKey = Object.keys(settingsWalletGroup).find((wKey) => wKey === `wallet_${name}`);

      if (walletKey !== undefined) {
        walletSettings = settingsWalletGroup[walletKey];
      }
    } catch (err) {
      // nothing to do: walletSettings is invalid so set to default
    }

    this.initializeSettings('settings.wallet', this.settingsWallet, walletSettings);
    this._loadedWallet.next(foundWallet);
    const storedActiveWallet = this.get('settings.global.selectedWallet');

    if (storedActiveWallet !== name) {
      this.save({label: 'settings.global.selectedWallet', value: name});
    }
    this.changeRpcWalletOnly(name);
  }

  private initializeSettings(label: string, structure: Setting | SettingStructure, storedValue: any) {
    if (!((<SettingStructure>structure) instanceof Setting)) {
      if (Object.prototype.toString.call(structure) === '[object Object]') {
        const keys = Object.keys(structure);
        for (const key of keys) {
          const ref = Object.prototype.toString.call(storedValue) === '[object Object]' ? storedValue[key] : null;
          this.initializeSettings(`${label}.${key}`, structure[key], ref);
        }
      }
    } else {
      structure.label = label;
      if ( !(storedValue === null || storedValue === undefined) ) {
        structure.value = storedValue;
      }
      this.settings[label] = structure;
      this.set(structure.label, structure.value);
    }
  }

  private writeValues(saveLocation: SaveLocation, newSettings: KeyValue[]) {

    // Write to persistent storage
    switch (saveLocation) {
      case SaveLocation.LOCALSTORAGE:
        let localStorageSettings = {};
        try {
          localStorageSettings = JSON.parse(localStorage.getItem('settings') || '{}') || {};
        } catch (_err) {
          // nothing to do
        }
        for (const newSetting of newSettings) {
          const storageKeys = newSetting.label.split('.');
          let currentRef = localStorageSettings;

          for (let ii = 1; ii < storageKeys.length; ++ii) {

            const storageKey = storageKeys[ii];

            if (ii === (storageKeys.length - 1)) {
              currentRef[storageKey] = newSetting.value;
            } else {
              if (Object.prototype.toString.call(currentRef[storageKey]) !== '[object Object]') {
                currentRef[storageKey] = {};
              }
              currentRef = currentRef[storageKey];
            }

            if (ii === 1) {
              if (storageKey === 'wallet') {
                const walletName = `wallet_${this._loadedWallet.getValue().name}`;
                if (Object.prototype.toString.call(currentRef[walletName]) !== '[object Object]') {
                  currentRef[walletName] = {};
                }
                currentRef = currentRef[walletName];
              }
            }
          }

          try {
            localStorage.setItem('settings', JSON.stringify(localStorageSettings));
          } catch(_err) {
            // well, I guess that blows...
          }
        }
        break;
    }

    // Write to the in-memory values and broadcast the changes
    for (const newSetting of newSettings) {
      const setting = <Setting>this.settings[newSetting.label];
      setting.value = newSetting.value;
      this.set(newSetting.label, newSetting.value);
    }
  }

}
