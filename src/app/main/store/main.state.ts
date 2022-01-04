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
  WalletBalanceStateModel,
  WalletSettingsStateModel,
  PublicUTXO,
  BlindUTXO,
  AnonUTXO,
  DEFAULT_RING_SIZE,
  DEFAULT_UTXO_SPLIT,
} from './main.models';
import { MainActions, WalletDetailActions } from './main.actions';
import { AppSettings } from 'app/core/store/app.actions';
import { Observable, concat, forkJoin } from 'rxjs';
import { concatMap, tap, mapTo, map } from 'rxjs/operators';
import { xorWith } from 'lodash';
import { WalletInfoService } from '../services/wallet-info/wallet-info.service';
import { SettingsService } from 'app/core/services/settings.service';
import { PartoshiAmount } from 'app/core/util/utils';


const MAIN_STATE_TOKEN = new StateToken<MainStateModel>('main');
const WALLET_INFO_STATE_TOKEN = new StateToken<WalletInfoStateModel>('walletinfo');
const WALLET_STAKING_INFO_STATE_TOKEN = new StateToken<WalletStakingStateModel>('walletstakinginfo');
const WALLET_UTXOS_TOKEN = new StateToken<WalletBalanceStateModel>('walletutxos');
const WALLET_SETTINGS_STATE_TOKEN = new StateToken<WalletSettingsStateModel>('walletsettings');


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
  coin_in_stakeable_script: 0,
};


const DEFAULT_UTXOS_STATE: WalletBalanceStateModel = {
  public: [],
  blind: [],
  anon: [],
  lockedPublic: 0,
  lockedBlind: 0,
  lockedAnon: 0,
};


const DEFAULT_WALLET_SETTINGS_STATE: WalletSettingsStateModel = {
  notifications_payment_received: false,
  notifications_staking_reward: false,
  utxo_split_count: DEFAULT_UTXO_SPLIT,
  default_ringct_size: DEFAULT_RING_SIZE,
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


  static hasEncryptionPassword() {
    return createSelector(
      [WalletInfoState.getValue('encryptionstatus')],
      (status: string): boolean => ['Locked', 'Unlocked, staking only', 'Unlocked'].includes(status)
    );
  }


  constructor(
    private _walletService: WalletInfoService
  ) {}


  @Action(MainActions.LoadWalletData)
  loadAllWalletData(ctx: StateContext<WalletInfoStateModel>) {
    const current = ctx.getState();
    if (!current.hdseedid || (current.walletname === null)) {
      return concat(
        ctx.dispatch(new WalletDetailActions.ResetBalances()),
        ctx.dispatch(new WalletDetailActions.ResetStakingInfo())
      );
    }

    return concat(
      ctx.dispatch(new MainActions.RefreshWalletInfo()),
      ctx.dispatch(new WalletDetailActions.RefreshBalances()),
      ctx.dispatch(new WalletDetailActions.GetColdStakingInfo())
    );
  }


  @Action(MainActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletInfoStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE)));
  }


  @Action(MainActions.Initialize)
  onMainInitialized(ctx: StateContext<WalletInfoStateModel>) {
    // Set the initial wallet info state, with the current wallet obtained from core.
    return this.updateWalletInfo(ctx);
  }


  @Action(MainActions.ChangeWallet)
  changeActiveWallet(ctx: StateContext<WalletInfoStateModel>, action: MainActions.ChangeWallet) {
    return ctx.dispatch(new AppSettings.SetActiveWallet(action.wallet)).pipe(
      concatMap(() => this.updateWalletInfo(ctx))
    );
  }


  @Action(MainActions.ChangeSmsgWallet)
  changeSmsgWallet(ctx: StateContext<WalletInfoStateModel>, action: MainActions.ChangeSmsgWallet) {
    return this._walletService.setSmsgActiveWallet(action.walletname);
  }


  @Action(MainActions.RefreshWalletInfo)
  refreshWalletInfo(ctx: StateContext<WalletInfoStateModel>) {
    if (ctx.getState().walletname !== null) {
      return this.updateWalletInfo(ctx, false);
    }
  }


  private updateWalletInfo(ctx: StateContext<WalletInfoStateModel>, loadSettings: boolean = true): Observable<void> {
    const info$ = this._walletService.getWalletInfo(1).pipe(
      tap((info: RpcGetWalletInfo) => {
        if ( (typeof info === 'object')) {
          const newState = JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE));
          const keys = Object.keys(newState);

          for (const key of keys) {
            if ((key in info) && (newState[key] !== info[key])) {
              newState[key] = info[key];
            }
          }
          ctx.patchState(newState);
        }
      })
    );

    return loadSettings ?
        info$.pipe(concatMap(info => ctx.dispatch(new WalletDetailActions.GetSettings(info.walletname)))) :
        info$.pipe(mapTo(undefined));
  }
}


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


  @Action(WalletDetailActions.ResetStakingInfo)
  onResetStakingInfo(ctx: StateContext<WalletStakingStateModel>) {
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

        if (typeof result.coin_in_coldstakeable_script === typeof currentState.coin_in_stakeable_script) {
          updatedValues['coin_in_stakeable_script'] = result.coin_in_stakeable_script;
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



@State<WalletBalanceStateModel>({
  name: WALLET_UTXOS_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE))
})
export class WalletBalanceState {

  static getValue(field: string) {
    return createSelector(
      [WalletBalanceState],
      (state: WalletBalanceState): any[] => {
        return field in state ? state[field] : [];
      }
    );
  }


  static utxosPublic() {
    return createSelector(
      [WalletBalanceState.getValue('public')],
      (utxos: PublicUTXO[]): PublicUTXO[] => utxos
    );
  }


  static utxosBlind() {
    return createSelector(
      [WalletBalanceState.getValue('blind')],
      (utxos: BlindUTXO[]): BlindUTXO[] => utxos
    );
  }


  static utxosAnon() {
    return createSelector(
      [WalletBalanceState.getValue('anon')],
      (utxos: AnonUTXO[]): AnonUTXO[] => utxos
    );
  }


  static spendableAmountPublic() {
    return createSelector(
      [WalletBalanceState.utxosPublic()],
      (utxos: PublicUTXO[]): string => WalletBalanceState.calculateSpendableAmounts(utxos)
    );
  }


  static spendableAmountBlind() {
    return createSelector(
      [WalletBalanceState.utxosBlind()],
      (utxos: BlindUTXO[]): string => WalletBalanceState.calculateSpendableAmounts(utxos)
    );
  }


  static spendableAmountAnon() {
    return createSelector(
      [WalletBalanceState.utxosAnon()],
      (utxos: AnonUTXO[]): string => WalletBalanceState.calculateSpendableAmounts(utxos)
    );
  }


  static spendableTotal() {
    return createSelector(
      [WalletBalanceState.spendableAmountPublic(), WalletBalanceState.spendableAmountBlind(), WalletBalanceState.spendableAmountAnon()],
      (p: string, b: string, a: string): string => (new PartoshiAmount(+p, false))
        .add(new PartoshiAmount(+b, false))
        .add(new PartoshiAmount(+a, false))
        .particlsString()
    );
  }

  static lockedPublic() {
    return createSelector(
      [WalletBalanceState.getValue('lockedPublic')],
      (value: number): number => value
    );
  }

  static lockedBlind() {
    return createSelector(
      [WalletBalanceState.getValue('lockedBlind')],
      (value: number): number => value
    );
  }

  static lockedAnon() {
    return createSelector(
      [WalletBalanceState.getValue('lockedAnon')],
      (value: number): number => value
    );
  }

  static lockedTotal() {
    return createSelector(
      [WalletBalanceState.lockedPublic(), WalletBalanceState.lockedBlind(), WalletBalanceState.lockedAnon()],
      (p: number, b: number, a: number): number => (new PartoshiAmount(p, false))
        .add(new PartoshiAmount(b, false))
        .add(new PartoshiAmount(a, false))
        .particls()
    );
  }


  private static calculateSpendableAmounts(utxos: PublicUTXO[] | BlindUTXO[] | AnonUTXO[]) {
    const tempBal = new PartoshiAmount(0);

    for (const utxo of utxos) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount));
      }
    }

    return tempBal.particlsString();
  }


  constructor(
    private _walletService: WalletInfoService
  ) {}


  @Action(MainActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletBalanceStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE)));
  }


  @Action(WalletDetailActions.ResetBalances)
  onResetBalances(ctx: StateContext<WalletBalanceStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE)));
  }


  @Action(WalletDetailActions.RefreshBalances)
  fetchWalletBalances(ctx: StateContext<WalletBalanceStateModel>) {
    return forkJoin({
      utxos: this._walletService.getAllUTXOs().pipe(
        map((result) => {

          const updatedValues = {};
          const currentState = ctx.getState();

          const resultKeys = Object.keys(result);
          for (const resKey of resultKeys) {
            if (resKey in currentState) {
              if (!result[resKey].length) {
                updatedValues[resKey] = [];
              } else if (
                (currentState[resKey].length !== result[resKey].length) ||
                (xorWith<PublicUTXO | BlindUTXO | AnonUTXO>(
                  currentState[resKey],
                  result[resKey],
                  (val, otherVal) => (val.txid === otherVal.txid) && (val.vout === otherVal.vout)
                ).length > 0)
              ) {
                updatedValues[resKey] = result[resKey];
              }
            }
          }

          return updatedValues;
        })
      ),

      locked: this._walletService.getLockedBalance().pipe(
        map(result => {
          const currentState = ctx.getState();
          const updatedValues = {};

          if (currentState.lockedPublic !== result.public) { updatedValues['lockedPublic'] = result.public; }
          if (currentState.lockedBlind !== result.blind) { updatedValues['lockedBlind'] = result.blind; }
          if (currentState.lockedAnon !== result.anon) { updatedValues['lockedAnon'] = result.anon; }

          return updatedValues;
        })
      )
    }).pipe(
      tap(updates => {
        const updatedValues = { ...updates.locked, ...updates.utxos };
        if (Object.keys(updatedValues).length > 0) {
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


  @Selector()
  static settings(state: WalletSettingsStateModel): WalletSettingsStateModel {
    return state;
  }


  constructor(
    private _settings: SettingsService
  ) {}

  @Action(WalletDetailActions.GetSettings)
  loadWalletSettings(ctx: StateContext<WalletSettingsStateModel>, action: WalletDetailActions.GetSettings) {

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
      }
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
}
