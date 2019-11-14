import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { Observable, Observer, BehaviorSubject } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';

import { StateService } from 'app/core/state/state.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService, IWallet } from 'app/multiwallet/multiwallet.service';
import { IpcService } from 'app/core/ipc/ipc.service';

enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean'
};

/**
 * Indicates the location where various settings are saved
 * Adding a new value here requires:
 *  -> Add a method to this component named loadSettingsFromXXXXXX
 *      = where XXXXXX is the enum label
 *      = accepts a string[] containing the settings labels to be loaded,
 *      = which returns an object that contains
 *          the setting label as a key,
 *          an appropriate value to be loaded as the startup value for the setting label
 *  -> Add a method to this component named saveSettingsToXXXXXX
 *      = where XXXXXX is the enum label
 *      = accepts a KeyValue[] containing the settings (label and new value) to be saved
 */
enum SaveLocation {
  LOCALSTORAGE = 0,
  CORECONFIG = 1
};

class Setting {
  constructor(private _location: SaveLocation, private _type: SettingType, private _default: any) {
     if (typeof _default !== _type) {
        this._default = null;
     }
  }

  get defaultValue(): any { return this._default; };
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

  // The defined settings
  private settings: SettingStructure = {
    'settings.global.fallbackWallet': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, ''),
    'settings.global.selectedWallet': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, ''),
    'settings.global.activeWallet': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, ''),
    'settings.global.language': new Setting(SaveLocation.LOCALSTORAGE, SettingType.STRING, 'en_us'),

    'settings.market.env.port': new Setting(SaveLocation.LOCALSTORAGE, SettingType.NUMBER, 3000),

    'settings.core.network.proxy': new Setting(SaveLocation.CORECONFIG, SettingType.STRING, ''),
    'settings.core.network.upnp': new Setting(SaveLocation.CORECONFIG, SettingType.BOOLEAN, false)
  };

  // Define wallet specific settings: prefixed with 'settings.wallet'.
  //  Separate as this content is dynamically loaded as the wallet is changed in the application.
  private settingsWallet: SettingStructure = {
    notifications: {
       'payment_received': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
       'staking_reward': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
       'order_updated': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
       'proposal_arrived': new Setting(SaveLocation.LOCALSTORAGE, SettingType.BOOLEAN, true),
    } as SettingStructure
  };

  constructor(
    private _rpc: RpcService,
    private _ipc: IpcService,
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

  /**
   * Indicates whether the settings have been loaded and initialized
   */
  get initialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Provides an observable reference to the current selected IWallet wallet
   */
  currentWallet(): Observable<IWallet> {
    return this._loadedWallet
      .asObservable()
      .pipe(
        takeWhile(() => !this.isDestroyed)
      );
  }

  /**
   * Change to a named wallet. If the wallet does not exist, then no changes occur.
   * Note: if successfully changed, both the 'global.activeWallet' and the 'global.selectedWallet' wallet settings are updated.
   *
   * @param name The name of the wallet to attempt to change to
   */
  async changeToWallet(name: string) {
    await this.changeWallet(name);
  }

  /**
   * Allows for changing the wallet the rpc calls are made against, without changing the current selected wallet.
   * This is only useful when needing to "change" to run calls against a different walelt to the currently selected wallet.
   * Actually only practical at the moment for the wallet creation process, where if the user closes the application then
   *  the create wallet process is not started on the next application launch attempt because the 'global.selectedWallet'
   *  setting was updated.
   * @param name The name of the wallet
   */
  changeRpcWalletOnly(name: string) {
    this.save({label: 'settings.global.activeWallet', value: name});
    this._rpc.setWalletName(name);
  }

  /**
   * Saves all the settings indicated.
   * Saving only occurs if all of the settings are valid (ie: are actual setting and have the correct data type values)
   * @param updates The list of settings to be saved
   * @returns A list of invalid settings provided. If a non-empty list is returned then none of the settings have been saved.
   */
  saveAll(updates: KeyValue[]): string[] {
    const failures: string[] = [];

    // Ensure all settings being updated are actual known settings
    updates.forEach((update) => {
      if (!(update.label in this.settings)) {
        failures.push(update.label);
      }
    });

    if (failures.length > 0) {
      return failures;
    }

    // Group the settings by where they are going to be saved (should, in most cases, be better to set all the changes together).
    const settingGroups = {};
    for (const update of updates) {
      const actualSetting = <Setting>this.settings[update.label];
      let isValid = false;

      if (typeof update.value === actualSetting.type) {
        const storageType = actualSetting.location.toString();

        if (!settingGroups[storageType]) {
          settingGroups[storageType] = [];
        }
        isValid = true;
        settingGroups[storageType].push(update);
      }

      if (!isValid) {
        failures.push(update.label);
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

  /**
   * Same as saveAll() but provides a convenience single setting save method
   * @param setting the setting to be saved
   * @returns A list of invalid settings provided. If a non-empty list is returned then none of the settings have been saved.
   */
  save(setting: KeyValue): string[] {
    return this.saveAll([setting]);
  };

  async deleteWallet(walletName: string, switchToWallet: string): Promise<boolean> {
    await this.changeToWallet(switchToWallet);
    if (this.get('settings.global.selectedWallet') === walletName) {
      return false;
    }

    const unloaded = await this._rpc.call('unloadwallet', [walletName]).toPromise().then(() => {
      return true;
    }).catch(() => {
      return false;
    });

    if (!unloaded) {
      await this.changeToWallet(walletName);
      return false;
    }

    const success = await this._ipc.runCommand('ipc-delete-wallet', null, walletName).toPromise();
    if (!success) {
      await this.changeToWallet(walletName);
    }
    return success;
  }

  async backupWallet(folderPath: string): Promise<boolean> {
    const success = await this._rpc.call('backupwallet', [folderPath]).toPromise().then(() => true).catch(() => false);
    return success;
  }

  /**
   * (PRIVATE)
   * Waits for the rpc service and multiwallet service to initialize and become available,
   *  as the initialization of this service depends on the availability of those 2 services.
   */
  private initializeComponent(observer: Observer<any>) {
    if (this.isDestroyed) {
      observer.complete();
      return;
    }

    if (!this._rpc.enabled || !this._multi.initComplete) {
      setTimeout(this.initializeComponent.bind(this), 1500, observer);
      return;
    }

    observer.next(null);
    observer.complete();
  }

  /**
   * (PRIVATE)
   * Performs the actual initialization (first setup) of this service.
   */
  private async start(): Promise<void> {

    const locationGroups = {};
    const settingKeys = Object.keys(this.settings);

    for (const settingKey of settingKeys) {
      const actualSetting = <Setting>this.settings[settingKey];
      const location = String(actualSetting.location);
      if ( !locationGroups[location] ) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(settingKey);
    }

    const groups = Object.keys(locationGroups);

    for (const group of groups) {
      const locationName = `loadSettingsFrom${SaveLocation[+group]}`;
      let values = {};
      if (typeof this[locationName] === 'function') {
        values = this[locationName](locationGroups[group]);
      }

      for (const settingLabel of locationGroups[group]) {
        const extractedValue = typeof values === 'object' ? values[settingLabel] : null;
        const setting = <Setting>this.settings[settingLabel];

        let startValue = setting.defaultValue;
        if (typeof extractedValue === setting.type) {
          startValue = extractedValue;
        }
        this.set(settingLabel, startValue);
      }
    }

    // Load the dynamically defined starting wallet
    const allWallets = await this._multi.list.pipe(take(1)).toPromise();
    const allWalletsNames = allWallets.map(w => w.name);

    const savedfallbackWalletName = this.get('settings.global.fallbackWallet');
    const savedLastUsedWalletName = this.get('settings.global.selectedWallet');

    let targetWalletName = allWalletsNames[0];
    const fallbackWalletName = allWalletsNames.find((w) => w === savedfallbackWalletName);
    if (typeof fallbackWalletName === 'string') {
      targetWalletName = fallbackWalletName;
    }

    const lastUsedWalletName = allWalletsNames.find((w) => w === savedLastUsedWalletName);
    if (lastUsedWalletName) {
      targetWalletName = lastUsedWalletName;
    }

    // Attempt to set and load the extracted wallet name
    await this.changeWallet(targetWalletName);

    this._isInitialized = true;
  }

  /**
   * (PRIVATE)
   * Performs the actual steps necessary to switch to a different wallet.
   * If the wallet does not exist then it is ignored
   *
   * @param name Name of the wallet to change to.
   */
  private async changeWallet(name: string) {
    // Check that the requested wallet name actually exists
    const allWallets = await this._multi.list.pipe(take(1)).toPromise();
    const foundWallet = allWallets.find((w) => w.name === name);

    if (foundWallet === undefined) {
      return;
    }

    // Find the saved stored settings for the requested wallet
    let walletSettings = {};
    try {
      const localStorageSettings = JSON.parse(localStorage.getItem('settings') || '{}') || {};
      const storedWalletSettings = localStorageSettings['wallet'] || {};
      let settingsWalletGroup = {};
      if (Object.prototype.toString.call(settingsWalletGroup) === '[object Object]') {
        settingsWalletGroup = storedWalletSettings;
      }
      const walletKey = Object.keys(settingsWalletGroup).find((wKey) => wKey === `wallet_${name}`);

      if (walletKey !== undefined) {
        walletSettings = settingsWalletGroup[walletKey];
      }
    } catch (_err) {
      // nothing to do: walletSettings is invalid so set to default
    }

    // Load any saved stored settings, and change the current wallet
    this.initializeSettings('settings.wallet', this.settingsWallet, walletSettings);
    this._loadedWallet.next(foundWallet);

    const storedActiveWallet = this.get('settings.global.selectedWallet');
    if (storedActiveWallet !== name) {
      this.save({label: 'settings.global.selectedWallet', value: name});
    }
    this.changeRpcWalletOnly(name);
  }

  /**
   * (PRIVATE)
   * Extracts settings from a SettingsStructure object, saving the period joined keys in a flat object (this.settings)
   *
   * @param label The label to save the setting as (called from another method, this should be the setting prefix)
   * @param structure The SettingStructure object containing the actual settings to create/update
   * @param storedValue An object representing the values to load
   */
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
      let actualValue = structure.defaultValue;
      if (typeof storedValue === structure.type) {
        actualValue = storedValue;
      }
      this.settings[label] = structure;
      this.set(label, actualValue);
    }
  }

  /**
   * (PRIVATE)
   * Performs the actual persistence of a group of settings, according to where they are going to be persisted to.
   * @param saveLocation The persistence mechanism
   * @param newSettings The list of settings to be persisted in the particular storage location.
   */
  private writeValues(saveLocation: SaveLocation, newSettings: KeyValue[]) {

    const locationName = `saveSettingsTo${SaveLocation[+saveLocation]}`;
    if (typeof this[locationName] === 'function') {
      this[locationName](newSettings);

      // Update this.settings and broadcast the changes
      for (const newSetting of newSettings) {
        this.set(newSetting.label, newSetting.value);
      }
    }
  }

  /**
   * (PRIVATE)
   * A SaveLocation save function, saves settings to window.localStorage.
   * @param newSettings Array of setting labels and their values to be saved
   *
   */
  private saveSettingsToLOCALSTORAGE(newSettings: KeyValue[]) {
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
      } catch (_err) {
        // well, I guess that might a bit of a problem
      }
    }
  }

  /**
   * (PRIVATE)
   * A SaveLocation save function, saves settings to particl.conf.
   * @param newSettings Array of setting labels and their new values to be saved
   *
   */
  private saveSettingsToCORECONFIG(newSettings: KeyValue[]) {
    const saveSettings = {};
    for (const setting of newSettings) {
      if (setting.label.startsWith('settings.core.network.') ) {
        saveSettings[setting.label.replace('settings.core.network.', '')] = setting.value;
      }
    }
    if (Object.keys(saveSettings).length > 0) {
      this._ipc.runCommand('write-core-config', null, saveSettings);
    }
  }

  /**
   * (PRIVATE)
   * A SaveLocation load function, loads settings saved in window.localStorage.
   * @param keys Array of setting labels for which values may be loaded from this location
   * @returns Object containing string:any key/value combinations of settings labels and their initial values to be loaded
   */
  private loadSettingsFromLOCALSTORAGE(keys: string[]): any {
    const settingValues = {};
    let localStorageSettings = {};
    try {
      localStorageSettings = JSON.parse(localStorage.getItem('settings') || '{}') || {};
    } catch (_err) {
      // nothing to do
    }
    for (const key of keys) {
      const storageKeys = key.split('.');
      let currentRef = localStorageSettings;

      for (let ii = 1; ii < storageKeys.length; ++ii) {
        const storageKey = storageKeys[ii];

        if (ii === (storageKeys.length - 1)) {
          if (currentRef[storageKey] !== undefined) {
            settingValues[key] = currentRef[storageKey];
          }
        } else {
          if (Object.prototype.toString.call(currentRef[storageKey]) !== '[object Object]') {
            currentRef[storageKey] = {};
          }
          currentRef = currentRef[storageKey];
        }
      }
    }

    return settingValues;
  }

  /**
   * (PRIVATE)
   * A SaveLocation load function, loads settings saved in particl.conf.
   * @param keys Array of setting labels for which values may be loaded from this location
   * @returns Object containing string:any key/value combinations of settings labels and their initial values to be loaded
   */
  private loadSettingsFromCORECONFIG(keys: string[]): any {
    const settingValues = {};
    const userConfig = this._rpc.coreConfig;

    if (userConfig.proxy) {
      settingValues['settings.core.network.proxy'] = userConfig.proxy;
    }
    settingValues['settings.core.network.upnp'] = Boolean(+userConfig.upnp);
    return settingValues;
  }
}
