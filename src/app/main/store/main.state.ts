import {
  State,
  StateToken,
  StateContext,
  createSelector,
  Action,
  Selector
} from '@ngxs/store';

import { MainStateModel, WalletInfoStateModel, RpcGetWalletInfo, WalletStakingStateModel, RpcGetColdStakingInfo  } from './main.models';
import { MainActions, WalletDetailActions } from './main.actions';
import { AppSettings } from 'app/core/store/app.actions';
import { Observable, concat } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { WalletInfoService } from '../services/wallet-info/wallet-info.service';


const MAIN_STATE_TOKEN = new StateToken<MainStateModel>('main');
const WALLET_INFO_STATE_TOKEN = new StateToken<WalletInfoStateModel>('walletinfo');
const WALLET_STAKING_INFO_STATE_TOKEN = new StateToken<WalletInfoStateModel>('walletstakinginfo');



const DEFAULT_WALLET_STATE: WalletInfoStateModel = {
  walletname: null,
  walletversion: 0,
  encryptionstatus: '',
  unlocked_until: 0,
  hdseedid: '',
  private_keys_enabled: false
};


const DEFAULT_STAKING_INFO_STATE: WalletStakingStateModel = {
  cold_staking_enabled: false,
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
        ctx.dispatch(new WalletDetailActions.GetColdStakingInfo())
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
      concatMap(() => {
        return this.updateWalletInfo(ctx)
      })
    );
  }


  @Action(MainActions.RefreshWalletInfo)
  refreshWalletInfo(ctx: StateContext<WalletInfoStateModel>) {
    if (ctx.getState().walletname !== null) {
      return this.updateWalletInfo(ctx);
    }
  }


  // @Action(ZMQ.UpdateStatus)
  // zmqUpdated(ctx: StateContext<WalletInfoStateModel>, action: ZMQ.UpdateStatus) {
  //   if (ctx.getState().hdseedid && action.field === 'hashtx') {
  //     return this.updateWalletInfo(ctx);
  //   }
  // }


  private updateWalletInfo(ctx: StateContext<WalletInfoStateModel>): Observable<RpcGetWalletInfo> {
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
      })
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
  loadAllWalletData(ctx: StateContext<WalletStakingStateModel>) {
    return this._walletService.getColdStakingInfo().pipe(
      tap((result: RpcGetColdStakingInfo) => {
        // console.log('@@@@@@ STATE PROCESSING OF RPC RESPONSE: ', result);
        if (typeof result.enabled === typeof ctx.getState().cold_staking_enabled) {
          ctx.patchState({cold_staking_enabled: result.enabled});
        }
      })
    );
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
