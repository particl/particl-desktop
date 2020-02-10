import {
  State,
  StateToken,
  StateContext,
  createSelector,
  Action,
  Selector
} from '@ngxs/store';

import {
  MainStateModel,
  WalletInfoStateModel,
  RpcGetWalletInfo,
  WalletStakingStateModel,
  RpcGetColdStakingInfo,
  WalletUTXOStateModel,
  WalletSettingsStateModel
} from './main.models';
import { MainActions, WalletDetailActions } from './main.actions';
import { AppSettings } from 'app/core/store/app.actions';
import { Observable, concat } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { xorWith } from 'lodash';
import { WalletInfoService } from '../services/wallet-info/wallet-info.service';
import { SettingsService } from 'app/core/services/settings.service';


const MAIN_STATE_TOKEN = new StateToken<MainStateModel>('main');
const WALLET_INFO_STATE_TOKEN = new StateToken<WalletInfoStateModel>('walletinfo');
const WALLET_STAKING_INFO_STATE_TOKEN = new StateToken<WalletStakingStateModel>('walletstakinginfo');
const WALLET_UTXOS_TOKEN = new StateToken<WalletUTXOStateModel>('walletutxos');
const WALLET_SETTINGS_STATE_TOKEN = new StateToken<WalletUTXOStateModel>('walletsettings');



const DEFAULT_WALLET_STATE: WalletInfoStateModel = {
  walletname: null,
  walletversion: 0,
  encryptionstatus: '',
  unlocked_until: 0,
  hdseedid: '',
  private_keys_enabled: false,
  total_balance: 0,
  balance: 0,
  blind_balance: 0,
  anon_balance: 0,
  staked_balance: 0,
  unconfirmed_balance: 0,
  unconfirmed_blind: 0,
  unconfirmed_anon: 0,
  immature_balance: 0,
  immature_anon_balance: 0,
};


const DEFAULT_STAKING_INFO_STATE: WalletStakingStateModel = {
  cold_staking_enabled: false,
  percent_in_coldstakeable_script: 0,
};


const DEFAULT_UTXOS_STATE: WalletUTXOStateModel = {
  public: [],
  blind: [],
  anon: []
};


const DEFAULT_WALLET_SETTINGS_STATE: WalletSettingsStateModel = {
  notifications_payment_received: true,
  notifications_staking_reward: true,
};


@State<WalletInfoStateModel>({
  name: WALLET_INFO_STATE_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE))
})
export class WalletInfoState {

  static getValue(field: string) {
    return createSelector(
      [WalletInfoState],
      (state: WalletInfoStateModel): number | string | boolean | null => {
        return field in state ? state[field] : null;
      }
    );
  }


  constructor(
    private _walletService: WalletInfoService
  ) {}


  @Action(MainActions.LoadWalletData)
  loadAllWalletData(ctx: StateContext<WalletInfoStateModel>) {
    const currentCtx = ctx.getState();
    if (currentCtx.hdseedid) {
      return concat(
        ctx.dispatch(new WalletDetailActions.GetColdStakingInfo()),
        ctx.dispatch(new WalletDetailActions.GetAllUTXOS()),
      );
    }
  }


  @Action(MainActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletInfoStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE)));
  }


  @Action(MainActions.Initialize)
  onMainInitialized(ctx: StateContext<WalletInfoStateModel>) {
    // Set the initial wallet info state, with the current wallet obtained from core.
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE)));

    return this.updateWalletInfo(ctx);
  }


  @Action(MainActions.ChangeWallet)
  changeActiveWallet(ctx: StateContext<WalletInfoStateModel>, action: MainActions.ChangeWallet) {
    return ctx.dispatch(new AppSettings.SetActiveWallet(action.wallet)).pipe(
      concatMap(() => this.updateWalletInfo(ctx))
    );
  }


  @Action(MainActions.RefreshWalletInfo)
  refreshWalletInfo(ctx: StateContext<WalletInfoStateModel>) {
    if (ctx.getState().walletname !== null) {
      return this.updateWalletInfo(ctx);
    }
  }


  private updateWalletInfo(ctx: StateContext<WalletInfoStateModel>): Observable<void> {
    return this._walletService.getWalletInfo().pipe(
      tap((info: RpcGetWalletInfo) => {
        if ( (typeof info === 'object')) {
          const newState = {};
          const currCtx = ctx.getState();
          const keys = Object.keys(currCtx);

          for (const key of keys) {
            if ((key in info) && (typeof currCtx[key] === typeof info[key]) && (currCtx[key] !== info[key])) {
              newState[key] = info[key];
            }
          }

          if (Object.keys(newState).length > 0) {
            ctx.patchState(info);
          }
        }
      }),

      concatMap(info => ctx.dispatch(new WalletDetailActions.GetSettings(info.walletname)))
    );
  }
};


@State<WalletStakingStateModel>({
  name: WALLET_STAKING_INFO_STATE_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_STAKING_INFO_STATE))
})
export class WalletStakingState {

  static getValue(field: string) {
    return createSelector(
      [WalletStakingState],
      (state: WalletStakingStateModel): number | string | boolean | null => {
        return field in state ? state[field] : null;
      }
    );
  }


  constructor(
    private _walletService: WalletInfoService
  ) {}


  @Action(MainActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletStakingStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_STAKING_INFO_STATE)));
  }


  @Action(WalletDetailActions.GetColdStakingInfo)
  fetchColdStakingData(ctx: StateContext<WalletStakingStateModel>) {
    return this._walletService.getColdStakingInfo().pipe(
      tap((result: RpcGetColdStakingInfo) => {

        const updatedValues = {};
        const currentState = ctx.getState();

        if (typeof result.enabled === typeof currentState.cold_staking_enabled) {
          updatedValues['cold_staking_enabled'] = result.enabled;
        }

        if (typeof result.percent_in_coldstakeable_script === typeof currentState.percent_in_coldstakeable_script) {
          updatedValues['percent_in_coldstakeable_script'] = result.percent_in_coldstakeable_script;
        }

        if (Object.keys(updatedValues).length > 0 ) {
          ctx.patchState(updatedValues);
        }
      })
    );
  }
}



@State<WalletUTXOStateModel>({
  name: WALLET_UTXOS_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE))
})
export class WalletUTXOState {

  static getValue(field: string) {
    return createSelector(
      [WalletUTXOState],
      (state: WalletUTXOState): any[] => {
        return field in state ? state[field] : 0;
      }
    );
  }


  constructor(
    private _walletService: WalletInfoService
  ) {}


  @Action(MainActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletUTXOStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE)));
  }


  @Action(WalletDetailActions.GetAllUTXOS)
  fetchAllUTXOS(ctx: StateContext<WalletUTXOStateModel>) {
    return this._walletService.getAllUTXOs().pipe(
      tap((result) => {

        const updatedValues = {};
        const currentState = ctx.getState();

        const resultKeys = Object.keys(result);
        for (const resKey of resultKeys) {
          if ((resKey in currentState) && (result[resKey].length > 0)) {
            if (
              (currentState[resKey].length !== result[resKey].length) ||
              (xorWith((val, otherVal) => (val.txid === otherVal.txid) && (val.vout === otherVal.vout)).length > 0)
            ) {
              updatedValues[resKey] = result[resKey];
            }
          }
        }

        if (Object.keys(updatedValues).length > 0 ) {
          ctx.patchState(updatedValues);
        }
      })
    );
  }
}



@State<WalletSettingsStateModel>({
  name: WALLET_SETTINGS_STATE_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_WALLET_SETTINGS_STATE))
})
export class WalletSettingsState {

  constructor(
    private _settings: SettingsService
  ) {}

  @Action(WalletDetailActions.GetSettings)
  getWalletSettings(ctx: StateContext<WalletSettingsStateModel>, action: WalletDetailActions.GetSettings) {

    if (typeof action.walletName === 'string') {
      const updatedValues = JSON.parse(JSON.stringify(DEFAULT_WALLET_SETTINGS_STATE));

      const settings = this._settings.fetchWalletSettings(action.walletName);

      const settingKeys = Object.keys(settings);
      for (const settingKey of settingKeys) {
        if ((settingKey in updatedValues) && (typeof updatedValues[settingKey] === typeof settings[settingKey])) {
          updatedValues[settingKey] = settings[settingKey];
        }
      }

      ctx.patchState(updatedValues);
    }
  }


  @Action(WalletDetailActions.SetSetting)
  changeWalletSetting(ctx: StateContext<WalletSettingsStateModel>, action: WalletDetailActions.SetSetting) {
    const currentState = DEFAULT_WALLET_SETTINGS_STATE;
    if ( Object.keys(currentState).includes(action.key) && (typeof currentState[action.key] === typeof action.value) ) {
      if (this._settings.saveWalletSetting(action.walletName, action.key, action.value)) {
        const obj = {};
        obj[action.key] = action.value;
        ctx.patchState(obj);
      };
    }
  }

}



@State<MainStateModel>({
  name: MAIN_STATE_TOKEN,
  defaults: {
    isInitialized: false
  },
  children: [WalletInfoState]
})
export class MainState {

  @Selector()
  static initialized(state: MainStateModel) {
    return state.isInitialized;
  }


  @Action(MainActions.Initialize)
  setInitializeState(ctx: StateContext<MainStateModel>, {init}: MainActions.Initialize) {
    ctx.patchState({isInitialized: init});
  }
};
