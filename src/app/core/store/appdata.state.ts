import {
  State,
  StateToken,
  Action,
  Selector,
  StateContext,
} from '@ngxs/store';

import { Global, AppData } from './app.actions';
import {
  AppDataStateModel,
} from './app.models';
import { PollingService } from '../services/polling.service';


const APP_DATA_TOKEN = new StateToken<AppDataStateModel>('appdata');


@State<AppDataStateModel>({
  name: APP_DATA_TOKEN,
  defaults: {
    networkInfo: {
      connections: 0
    },
    activeWalletInfo: {
      encryptionstatus: ''
    }
  }
})
export class AppDataState {

  @Selector()
  static network(state: AppDataStateModel) {
    return state.networkInfo;
  }


  @Selector()
  static wallet(state: AppDataStateModel) {
    return state.activeWalletInfo;
  }


  constructor(
    private _pollingService: PollingService
  ) {}

  @Action(Global.Connected)
  pollForData() {
    this._pollingService.start();
  }


  @Action(AppData.SetActiveWalletInfo)
  setWalletInfo(ctx: StateContext<AppDataStateModel>, {walletinfo}: AppData.SetActiveWalletInfo) {
    if (Object.prototype.toString.call(walletinfo) === '[object Object]') {
      const newVals = {};
      const currentState = ctx.getState().activeWalletInfo;
      const currentKeys = Object.keys(currentState);

      for (const key of currentKeys) {
        if (
          (walletinfo[key] !== null) &&
          (typeof walletinfo[key] === typeof currentState[key]) &&
          (walletinfo[key] !== currentState[key])
        ) {
          newVals[key] = walletinfo[key];
        }
      }

      if (Object.keys(newVals).length > 0) {
        ctx.patchState(newVals);
      }
    }
  }


  @Action(AppData.SetNetworkInfo)
  setNetworkInfo(ctx: StateContext<AppDataStateModel>, {network}: AppData.SetNetworkInfo) {
    if (Object.prototype.toString.call(network) === '[object Object]') {
      const newVals = {};
      const currentState = ctx.getState().networkInfo;
      const currentKeys = Object.keys(currentState);

      for (const key of currentKeys) {
        if (
          (network[key] !== null) &&
          (typeof network[key] === typeof currentState[key]) &&
          (network[key] !== currentState[key])
        ) {
          newVals[key] = network[key];
        }
      }

      if (Object.keys(newVals).length > 0) {
        ctx.patchState(newVals);
      }
    }
  }

}
