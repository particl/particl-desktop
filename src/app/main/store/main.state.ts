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


const MAIN_STATE_TOKEN = new StateToken<MainStateModel>('main');
const WALLET_INFO_STATE_TOKEN = new StateToken<WalletInfoStateModel>('walletinfo');


@State<WalletInfoStateModel>({
  name: WALLET_INFO_STATE_TOKEN,
  defaults: {
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
  }
})
export class WalletInfoState {

  static walletValue(field: string) {
    return createSelector(
      [WalletInfoState],
      (state: WalletInfoStateModel) => {
        return field in state ? state[field] : null;
      }
    );
  }


  @Action(MainActions.UpdateWalletInfo)
  setWalletInfo(ctx: StateContext<WalletInfoStateModel>, {info}: MainActions.UpdateWalletInfo) {
    ctx.patchState(info);
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
  static network(state: MainStateModel) {
    return state.isInitialized;
  }


  @Action(MainActions.Initialize)
  setInitializeState(ctx: StateContext<MainStateModel>, {init}: MainActions.Initialize) {
    ctx.patchState({isInitialized: init});
  }
};
