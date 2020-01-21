import {
  State,
  StateToken,
  Action,
  StateContext,
  Selector,
  NgxsOnInit
} from '@ngxs/store';
import { of, Observable } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

import { AppSettings } from './app.actions';
import {
  CoreConnectionModel,
  AppSettingsStateModel
} from './app.models';

import { SettingsService } from 'app/core/services/settings.service';
import { MultiwalletService } from '../services/multiwallets/multiwallets.service';


const APP_SETTINGS_TOKEN = new StateToken<CoreConnectionModel>('settings');


@State<AppSettingsStateModel>({
  name: APP_SETTINGS_TOKEN,
  defaults: {
    activatedWallet: '',
    language: 'en_us',
    marketActive: false,
    zmqPort: 36750
  }
})
export class AppSettingsState implements NgxsOnInit {


  @Selector()
  static activeWallet(appState: AppSettingsStateModel) {
    return appState.activatedWallet;
  }


  constructor(
    private _settings: SettingsService,
    private _multi: MultiwalletService
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


  @Action(AppSettings.SetActiveWallet)
  setActiveWallet(ctx: StateContext<AppSettingsStateModel>, {wallet}: AppSettings.SetActiveWallet) {
    const currentWallet = ctx.getState().activatedWallet;

    let loadWallet = currentWallet;

    // Allows for null wallets to be passed to load the current wallet. This should probably be a separate action...
    if (typeof wallet === 'string') {
      loadWallet = wallet;
      if (currentWallet === wallet) {
        return;
      }
    }

    return this.loadActiveWallet(loadWallet).pipe(
      concatMap((isValid) => {
        // if we got a value, set the current state correctly
        if (typeof isValid === 'boolean') {
          return ctx.dispatch(new AppSettings.SetSetting('global.activatedWallet', loadWallet));
        }

        // value was null (or something else), indicating an error occurred... fallback to
        if (wallet === null) {
          const failoverWallet = '';

          return this.loadActiveWallet(failoverWallet).pipe(
            concatMap((failoverValid) => {
              return typeof failoverValid === 'boolean' ?
                ctx.dispatch(new AppSettings.SetSetting('global.activatedWallet', failoverWallet)) : of(true)
            })
          )
        }
        return of(null);
      })
    );
  }


  @Action(AppSettings.SetSetting)
  setGlobalAppSetting(ctx: StateContext<AppSettingsStateModel>, action: AppSettings.SetSetting) {
    const currentState = ctx.getState();
    const parts = action.setting.split('.', 2);
    if (parts[0] === 'global' && Object.keys(currentState).includes(parts[1]) && (typeof currentState[parts[1]] === typeof action.value) ) {
      if (this._settings.saveGlobalSetting(parts[1], action.value)) {
        const obj = {};
        obj[parts[1]] = action.value;
        ctx.patchState(obj);
      };
    }
  }


  private loadActiveWallet(walletName: string): Observable<boolean | null> {
    return this._multi.loadWallet(walletName).pipe(
      // catch any thrown error from the loadWallet call
      catchError((err) => {
        return of(null);
      })
    );
  }
}
