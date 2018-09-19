import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { StateService } from 'app/core/state/state.service';
import { DEFAULT_GUI_SETTINGS } from 'app/core/util/utils';
import { SettingsService } from 'app/wallet/settings/settings.service';

// @TODO implement the required method related with settings if needed?

@Injectable()
export class SettingStateService extends StateService {
  log: any = Log.create('settings-state.service');

  constructor() {
    super();
    this.log.d('SettingStateService initialized.');
  }

  // @TODO register the settings keys for all settings keys.
  register(method: string, value: any): void {
    if (method) {
      this.set(method, value);
    } else {
      this.log.e('method required');
    }
  }
}
