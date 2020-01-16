import {
  State,
  StateToken,
  Action,
  Selector,
  StateContext,
  createSelector,
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
      connections: 0,
      timeoffset: 0,
      subversion: ''
    },
    activeWalletInfo: {
      encryptionstatus: ''
    },
    appVersions: {
      latestClient: ''
    }
  }
})
export class AppDataState {

  @Selector()
  static network(state: AppDataStateModel) {
    return state.networkInfo;
  }

  static networkValue(field: string) {
    return createSelector(
      [AppDataState],
      (state: AppDataStateModel) => {
        return state.networkInfo[field];
      }
    );
  }


  static versionValue(field: string) {
    return createSelector(
      [AppDataState],
      (state: AppDataStateModel) => {
        return state.appVersions[field];
      }
    );
  }


  @Selector()
  static walletInfo(state: AppDataStateModel) {
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
        ctx.patchState({activeWalletInfo: {...currentState, ...newVals}});
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
        ctx.patchState({networkInfo: {...currentState, ...newVals}});
      }
    }
  }


  @Action(AppData.SetVersionInfo)
  setVersionInfo(ctx: StateContext<AppDataStateModel>, {versions}: AppData.SetVersionInfo) {
    if (Object.prototype.toString.call(versions) === '[object Object]') {
      const newVals = {};
      const currentState = ctx.getState().appVersions;
      const currentKeys = Object.keys(currentState);

      for (const key of currentKeys) {
        if (
          (versions[key] !== null) &&
          (typeof versions[key] === typeof currentState[key]) &&
          (versions[key] !== currentState[key])
        ) {
          newVals[key] = versions[key];
        }
      }

      if (Object.keys(newVals).length > 0) {
        ctx.patchState({appVersions: {...currentState, ...newVals}});
      }
    }
  }

}
