import { xorWith } from 'lodash';
import {
  State,
  StateToken,
  Action,
  Selector,
  StateContext,
  createSelector,
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { Global, AppData } from './app.actions';
import {
  AppDataStateModel,
  PeerInfo,
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
    appVersions: {
      latestClient: ''
    },
    peers: [],
    currentBlockHeight: 0,
  }
})
export class AppDataState {

  @Selector()
  static network(state: AppDataStateModel) {
    return state.networkInfo;
  }


  @Selector()
  static _peersList(state: AppDataStateModel) {
    return state.peers;
  }

  @Selector()
  static blockHeight(state: AppDataStateModel) {
    return state.currentBlockHeight;
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


  static peersInfo() {
    return createSelector(
      [AppDataState._peersList],
      (peers: PeerInfo[]) => peers
    );
  }


  constructor(
    private _pollingService: PollingService
  ) {}


  @Action(Global.Connected)
  pollForData() {
    this._pollingService.start();
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


  @Action(AppData.SetPeerInfo)
  setPeerInfo(ctx: StateContext<AppDataStateModel>, {peers}: AppData.SetPeerInfo) {
    if (Array.isArray(peers)) {
      const formattedPeers: PeerInfo[] = peers.map(p => ({
        address: (typeof p.addr === 'string') && p.addr ? p.addr : '',
        blockHeight: +p.currentheight >= 0 ? +p.currentheight : -1,
      }));
      const currentStatePeers = ctx.getState().peers;

      if (
        (currentStatePeers.length !== formattedPeers.length) ||
        (xorWith<PeerInfo>(
          currentStatePeers,
          formattedPeers,
          (curr, req) =>
            (curr.address === req.address) &&
            (curr.blockHeight === req.blockHeight)
        ).length > 0)
      ) {
        ctx.setState(patch<AppDataStateModel>({
          peers: formattedPeers
        }));
      }
    }
  }

  @Action(AppData.SetNodeCurrentBlockheight)
  setCurrentBlockheight(ctx: StateContext<AppDataStateModel>, {count}: AppData.SetNodeCurrentBlockheight) {
    if ((+count > 0) && (+count !== ctx.getState().currentBlockHeight)) {

      ctx.setState(patch<AppDataStateModel>({
        currentBlockHeight: +count
      }));
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
