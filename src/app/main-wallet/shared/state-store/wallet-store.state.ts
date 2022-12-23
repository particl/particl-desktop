import { Injectable } from '@angular/core';
import { State, StateToken, Selector, Action, StateContext, createSelector } from '@ngxs/store';
import { BackendService } from 'app/core/services/backend.service';
import { DEFAULT_UTXO_SPLIT, DEFAULT_RING_SIZE } from 'app/networks/particl/particl.models';
import { map, tap } from 'rxjs/operators';


const NETWORK_PARTICL_WALLET_SETTINGS_TOKEN = new StateToken<WalletSettingsStateModel>('particl_wallet_settings');
const NETWORK_PARTICL_WALLET_URLS_TOKEN = new StateToken<WalletSettingsStateModel>('particl_wallet_urls');


export interface WalletSettingsStateModel {
  notifications_payment_received: boolean;
  notifications_staking_reward: boolean;
  utxo_split_count: number;
  default_ringct_size: number;
}


export interface WalletURLStateModel {
  transaction: string;
  address: string;
}


export namespace SettingsActions {
  export class Load {
    static readonly type: string = '[Particl Wallet App] SettingsActions.Load';
    constructor(public walletName: string) {}
  }
  export class ChangeSetting {
    static readonly type: string = '[Particl Wallet App] SettingsActions.ChangeSetting';
    constructor(public walletName: string, public settingKey: keyof WalletSettingsStateModel, public newValue: unknown) {}
  }
  export class ChangeURL {
    static readonly type: string = '[Particl Wallet App] SettingsActions.ChangeURL';
    constructor(public urlKey: keyof WalletURLStateModel, public newValue: string) {}
  }
}


namespace IPCResponses {
  export interface WalletSettings {
    wallet: WalletSettingsStateModel;
  }

  export interface FetchUrls {
    transaction: string;
    address: string;
  }

  export type UpdateURL = boolean;
}

const DEFAULT_WALLET_SETTINGS_STATE: WalletSettingsStateModel = {
  notifications_payment_received: false,
  notifications_staking_reward: false,
  utxo_split_count: DEFAULT_UTXO_SPLIT,
  default_ringct_size: DEFAULT_RING_SIZE,
};


const DEFAULT_WALLET_URL_STATE: WalletURLStateModel = {
  transaction: '',
  address: '',
};


@State({
  name: NETWORK_PARTICL_WALLET_SETTINGS_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_WALLET_SETTINGS_STATE))
})
@Injectable()
export class WalletSettingsState {

  @Selector()
  static settings(state: WalletSettingsStateModel): WalletSettingsStateModel {
    return state;
  }

  private walletName: string | null = null;


  constructor(
    private _backendService: BackendService
  ) {}


  @Action(SettingsActions.Load)
  loadWalletSettings(ctx: StateContext<WalletSettingsStateModel>, { walletName }: SettingsActions.Load) {

    this.walletName = walletName;

    if (typeof walletName !== 'string') {
      ctx.setState(JSON.parse(JSON.stringify(DEFAULT_WALLET_SETTINGS_STATE)));
      return;
    }

    return this._backendService.sendAndWait<IPCResponses.WalletSettings>('apps:particl-wallet:wallet-settings', walletName).pipe(
      tap({
        next: (settings) => {
          const newState = JSON.parse(JSON.stringify(DEFAULT_WALLET_SETTINGS_STATE));
          if (typeof settings === 'object' && settings && Object.prototype.toString.call(settings.wallet) === '[object Object]') {
            for (const key of Object.keys(newState)) {
              if (typeof newState[key] === typeof settings.wallet[key]) {
                newState[key] = settings.wallet[key];
              }
            }
          }
          ctx.setState(newState);
        },
        error: () => ctx.setState(JSON.parse(JSON.stringify(DEFAULT_WALLET_SETTINGS_STATE))),
      })
    );
  }


  @Action(SettingsActions.ChangeSetting)
  updateSettingValue(ctx: StateContext<WalletSettingsStateModel>, { walletName, settingKey, newValue }: SettingsActions.ChangeSetting) {
    if (settingKey in DEFAULT_WALLET_SETTINGS_STATE && (typeof DEFAULT_WALLET_SETTINGS_STATE[settingKey] === typeof newValue)) {
      return this._backendService.sendAndWait<boolean>('apps:particl-wallet:update-wallet', walletName, settingKey, newValue).pipe(
        map(resp => typeof resp === 'boolean' ? resp : false),
        tap({
          next: (success) => {
            if (success && walletName === this.walletName) {
              ctx.patchState({[settingKey]: newValue});
            }
          }
        })
      );
    }
  }
}



@State({
  name: NETWORK_PARTICL_WALLET_URLS_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_WALLET_URL_STATE))
})
@Injectable()
export class WalletURLState {

  static get(field: keyof WalletURLStateModel) {
    return createSelector(
      [WalletURLState],
      (state: WalletURLState): string | undefined => {
        return state[field];
      }
    );
  }


  constructor(private _backendService: BackendService) { }


  @Action(SettingsActions.Load)
  loadURLs(ctx: StateContext<WalletURLStateModel>) {
    return this._backendService.sendAndWait<IPCResponses.FetchUrls>('apps:particl-wallet:fetchUrls').pipe(
      tap({
        next: (urls) => {
          if (Object.prototype.toString.call(urls) !== '[object Object]') {
            return;
          }
          const currentState = ctx.getState();
          const patchVals = {};
          for (const key of Object.keys(DEFAULT_WALLET_URL_STATE)) {
            if ((key in urls) && (typeof urls[key] === typeof DEFAULT_WALLET_URL_STATE[key]) && (currentState[key] !== urls[key])) {
              patchVals[key] = urls[key];
            }
          }

          if (Object.keys(patchVals).length > 0) {
            ctx.patchState(patchVals);
          }
        }
      })
    );
  }


  @Action(SettingsActions.ChangeURL)
  updateURL(ctx: StateContext<WalletURLStateModel>, { urlKey, newValue }: SettingsActions.ChangeURL) {
    if (!(urlKey in DEFAULT_WALLET_URL_STATE) || typeof newValue !== 'string') {
      return;
    }
    return this._backendService.sendAndWait<IPCResponses.UpdateURL>('apps:particl-wallet:updateUrl', urlKey, newValue).pipe(
      tap({
        next: (success) => {
          if (success) {
            ctx.patchState({ [urlKey]: newValue});
          }
        }
      })
    );
  }

}
