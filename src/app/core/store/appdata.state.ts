import {
  State,
  StateToken,
  Action,
  StateContext,
  Selector,
} from '@ngxs/store';

import { Global, AppData } from './app.actions';
import {
  AppDataModel,
} from './app.models';
import { PeerService } from '../services/peer.service';


const APP_DATA_TOKEN = new StateToken<AppDataModel>('appdata');


@State<AppDataModel>({
  name: APP_DATA_TOKEN,
  defaults: {
    peers: []
  }
})
export class AppDataState {

  @Selector()
  static peers(state: AppDataModel) {
    return state.peers;
  }

  constructor(
    private _peers: PeerService
  ) {}

  @Action(Global.Connected)
  pollForData() {
    this._peers.start();
  }


  @Action(AppData.GotPeers)
  setPeersList(ctx: StateContext<AppDataModel>, action: AppData.GotPeers) {
    ctx.patchState({
      peers: action.peers
    });
  }
}
