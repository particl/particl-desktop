import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MarketService } from 'app/core/market/market.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { SettingsGuiService } from 'app/core/settings-gui/settings-gui.service';
import { Settings } from 'app/wallet/settings/models/settings.model';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { DEFAULT_GUI_SETTINGS } from 'app/core/util/utils';

@Injectable()
export class SettingsService {

  defaultSettings: Settings;

  profileId: number;
  currentSettings: Settings;

  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private marketService: MarketService,
    private profileService: ProfileService,
    private _settingsGUIService: SettingsGuiService,
  ) {

    this.defaultSettings = new Settings(DEFAULT_GUI_SETTINGS);

    this.profileService.default().subscribe((profile: Profile) => {
      this.profileId = profile.id;
    })

    // @TODO change with the cmd calling and update settings after settings cmd response.

    /* Preload default settings if none found */
    if (localStorage.getItem('gui-settings') == null) {
      this.currentSettings = new Settings(this.defaultSettings);
      const settings: string = JSON.stringify(this.defaultSettings);
      localStorage.setItem('gui-settings', settings);

    } else {
      this.currentSettings = new Settings(this.loadSettings());
    }

    // set currentGUISettings state.
    this._rpcState.set('currentGUISettings', this.currentSettings);
    this._settingsGUIService.updateSettings(this.currentSettings);
  }

  loadSettings(): Object {
    return (JSON.parse(localStorage.getItem('gui-settings')));
  }

  applySettings(settings: Object): void {
    const oldSettings: string = localStorage.getItem('gui-settings');
    const newSettings: string = JSON.stringify(settings);

    if (oldSettings !== newSettings) {

      // update web-storage gui-settings.
      localStorage.setItem('gui-settings', newSettings);

      // update core settings.
      this._settingsGUIService.updateSettings(settings);

      // update current settings
      this.currentSettings = new Settings(settings);

      // set currentGUISettings state.
      this._rpcState.set('currentGUISettings', this.currentSettings);
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
