import {
  State,
  StateToken,
  Action,
  StateContext,
  Selector,
  NgxsOnInit
} from '@ngxs/store';
import { SettingsService } from 'app/core/services/settings.service';

import { AppSettings } from './app.actions';
import {
  AppStateModel,
  CoreConnectionModel,
  AppSettingsStateModel
} from './app.models';


const APP_SETTINGS_TOKEN = new StateToken<CoreConnectionModel>('settings');


@State<AppSettingsStateModel>({
  name: APP_SETTINGS_TOKEN,
  defaults: {
    activatedWallet: '',
    language: 'en_us',
    marketActive: false
  }
})
export class AppSettingsState implements NgxsOnInit {


  @Selector()
  static activeWallet(appState: AppSettingsStateModel) {
    return appState.activatedWallet;
  }


  constructor(
    private _settings: SettingsService
  ) {}

  ngxsOnInit(ctx: StateContext<AppSettingsStateModel>) {
    const saved = this._settings.fetchGlobalSettings();
    const current = ctx.getState();

    const newObj = {};

    for (const key of Object.keys(saved)) {
      if ( (key in current) && (typeof saved[key] === typeof current[key]) ) {
        newObj[key] = saved[key];
      }
    }

    ctx.patchState(newObj);
  }


  @Action(AppSettings.SetSetting)
  setGlobalAppSetting(ctx: StateContext<AppStateModel>, action: AppSettings.SetSetting) {
    const currentState = ctx.getState();
    const parts = action.setting.split('.', 2);
    if (parts[0] === 'global' && Object.keys(currentState).includes(parts[1]) && (typeof currentState[parts[1]] === action.value) ) {
      if (this._settings.saveGlobalSetting(parts[1], action.value)) {
        const obj = {};
        obj[parts[1]] = action.value;
        ctx.patchState(obj);
      };
    }
  }
}
