import {
  State,
  StateToken,
  StateContext,
  createSelector,
  Action,
  Selector
} from '@ngxs/store';

import { MainStateModel, WalletInfoStateModel  } from './main.models';
import { MainActions } from './main.actions';
import { Global, AppSettings } from 'app/core/store/app.actions';


const MAIN_STATE_TOKEN = new StateToken<MainStateModel>('main');
const WALLET_INFO_STATE_TOKEN = new StateToken<WalletInfoStateModel>('walletinfo');



const DEFAULT_WALLET_STATE = {
  walletname: null,
  walletversion: 0,
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
  txcount: 0,
  keypoololdest: 0,
  keypoolsize: 0,
  reserve: 0,
  encryptionstatus: '',
  unlocked_until: 0,
  paytxfee: 0,
  hdseedid: '',
  private_keys_enabled: false
};


@State<WalletInfoStateModel>({
  name: WALLET_INFO_STATE_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE))
})
export class WalletInfoState {

  static getValue(field: string) {
    return createSelector(
      [WalletInfoState],
      (state: WalletInfoStateModel): number | string | null => {
        return field in state ? state[field] : null;
      }
    );
  }


  @Action(MainActions.UpdateWalletInfo)
  setWalletInfo(ctx: StateContext<WalletInfoStateModel>, {info}: MainActions.UpdateWalletInfo) {
    if ( (typeof info.walletname === 'string') && (info.walletname.length > 0)) {
      ctx.patchState(info);
    }
  }


  @Action(AppSettings.SetActiveWallet)
  resetWalletDetails(ctx: StateContext<WalletInfoStateModel>) {
    // reset the wallet information when the active wallet changes
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE)));
  }
};


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
