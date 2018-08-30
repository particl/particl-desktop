import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MarketService } from 'app/core/market/market.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { SettingsGuiService } from 'app/core/settings-gui/settings-gui.service';

@Injectable()
export class SettingsService {

  needsUpdate: boolean = false;
  currentSettings: any;
  defaultSettings: Object = {
    main: {
      autostart: false,
      detachDatabases: 1,
      feeAmount: 1,
      feeCurrency: 1,
      autoRing: 1,
      minRing: 1,
      maxRing: 1,
      stake: 1,
      reserveAmount: 1,
      reserveCurrency: 1,
      rewardAddressEnabled: 1,
      rewardAddress: 1,
      foundationDonation: 1,
      secureMessaging: false,
      thin: false,
      thinFullIndex: false,
      thinIndexWindow: 4096,
      stakeInterval: 30
    },
    network: {
      upnp: false,
      proxy: false,
      proxyIP: '127.0.0.1',
      proxyPort: 9050,
      socketVersion: 5
    },
    window: {
      tray: false,
      minimize: true
    },
    display: {
      language: 'en',
      units: 'part',
      theme: 'light',
      rows: 10,
      addresses: true,
      notify: {
        message: true,
        sentTo: false,
        receivedWith: false,
        receivedFrom: false,
        selfPayment: false,
        partReceived: true,
        partSent: false,
        other: false
      },
      show: {
        sentTo: true,
        receivedWith: true,
        receivedFrom: true,
        selfPayment: true,
        partReceived: true,
        partSent: true,
        other: true
      },
    },
    navigation: {
      marketExpanded: true,
      walletExpanded: true
    },
    market: {
      enabled: true,
      listingsPerPage: 30,
      defaultCountry: undefined,
      listingExpiration: 4
    },
    i2p: {},
    tor: {}
  };

  profileId: number;

  constructor(
    private _rpc: RpcService,
    private marketService: MarketService,
    private profileService: ProfileService,
    private _settingsGUIService: SettingsGuiService,
  ) {
    this.profileService.default().subscribe((profile: Profile) => {
      this.profileId = profile.id;
    })

    // @TODO change with the cmd calling and update settings after settings cmd response.

    /* Preload default settings if none found */
    if (localStorage.getItem('gui-settings') == null) {
      this.currentSettings = this.defaultSettings;
      const settings: string = JSON.stringify(this.defaultSettings);
      localStorage.setItem('gui-settings', settings);

    } else {

      this.currentSettings = this.loadSettings();

      // this.list().subscribe((settings: any) => {
      // })
    }
    this._settingsGUIService.updateSettings(this.currentSettings);
  }

  loadSettings(): Object {
    return (JSON.parse(localStorage.getItem('gui-settings')));
  }

  applySettings(settings: Object): void {
    const oldSettings: string = localStorage.getItem('gui-settings');
    const newSettings: string = JSON.stringify(settings);

    localStorage.setItem('gui-settings', newSettings);
    this._settingsGUIService.updateSettings(settings);
    if (oldSettings !== newSettings) {
      this.needsUpdate = true;
    }
  }

  // list market setting.
  list(): any {
    const params = ['list', this.profileId];
    return this.marketService.call('setting', params);
  }

  // set market setting.
  set(key: string, value: any): any {
    const params = ['set', this.profileId, key, value]
    return this.marketService.call('setting', params);
  }

  // remove market setting.
  remove(key: string): any {
    const params = ['remove', this.profileId, key]
    return this.marketService.call('setting', params);
  }

  // get market setting.
  get(key: string): any {
    const params = ['get', this.profileId, key]
    return this.marketService.call('setting', params);
  }
}
