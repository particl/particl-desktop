import { State, StateToken, Action, StateContext } from '@ngxs/store';
import { Global } from './app.actions';
import { ConnectionService } from '../services/connection.service';


enum APP_MODE {
  WALLET = 'wallet',
  MARKET = 'market'
};

export interface AppStateModel {
  isConnected: boolean;
  loadingMessage: string;
  appMode: APP_MODE;
}

const APP_STATE_TOKEN = new StateToken<AppStateModel>('global');


@State<AppStateModel>({
  name: APP_STATE_TOKEN,
  defaults: {
    isConnected: false,
    appMode: null,
    loadingMessage: ''
  }
})
export class ApplicationState {

  constructor(
    private _connectionService: ConnectionService
  ) {}

  @Action(Global.Initialize)
  initializeApplication() {
    this._connectionService.connect();
  }

  @Action(Global.SetLoadingMessage)
  setApplicationLoadingMessage(ctx: StateContext<AppStateModel>, action: Global.SetLoadingMessage) {
    ctx.patchState({
      loadingMessage: action.message
    })
  }

  // @Action(Global.Connected)
  // loadApplication(ctx: StateContext<AppStateModel>, action: Global.Connected) {
  // }
}
