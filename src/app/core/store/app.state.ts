import { State, StateToken, Action, StateContext, NgxsModuleOptions, Selector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

import { ConnectionService } from 'app/core/services/connection.service';

import { Global } from './app.actions';
import { AppStateModel, CoreConnectionModel, APP_MODE, ConnectionDetails } from './app.models';


export const ngxsConfig: NgxsModuleOptions = {
  developmentMode: !environment.production,
  selectorOptions: {
    // These selectorOption settings are recommended in preparation for NGXS v4
    suppressErrors: false,
    injectContainerState: false
  },
  compatibility: {
    strictContentSecurityPolicy: true
  }
};


const APP_STATE_TOKEN = new StateToken<AppStateModel>('global');
const CORE_CONFIG_TOKEN = new StateToken<CoreConnectionModel>('coreconnection');


@State<CoreConnectionModel>({
  name: CORE_CONFIG_TOKEN,
  defaults: {
    testnet: false,
    auth: btoa('test:test'),
    rpcbind: environment.particlHost,
    port: environment.particlPort,
    proxy: '',
    upnp: false
  }
})
export class CoreConnectionState {

  @Selector()
  static isTestnet(state: CoreConnectionModel) {
    return state.testnet;
  }

  @Action(Global.Connected)
  configureConnectionDetails(ctx: StateContext<CoreConnectionModel>, action: Global.Connected) {
    if (Object.prototype.toString.call(action.config) !== '[object Object]') {
      return;
    }

    if (typeof action.config.rpcbind === 'string' && action.config.rpcbind.length) {
      ctx.patchState({rpcbind: action.config.rpcbind});
    }

    if (typeof action.config.port === 'number' && action.config.port > 0) {
      ctx.patchState({port: action.config.port});
    }

    if (typeof action.config.auth === 'string' && action.config.auth.length) {
      ctx.patchState({auth: action.config.auth});
    }

    if (typeof action.config.proxy === 'string' && action.config.proxy.length) {
      ctx.patchState({proxy: action.config.proxy});
    }

    if (typeof action.config.upnp === 'boolean') {
      ctx.patchState({upnp: action.config.upnp});
    }

    const keys = Object.keys(action.config);
    if (keys.includes('upnp')) {
      ctx.patchState({upnp: Boolean(+action.config.upnp)});
    }

    if (keys.includes('testnet')) {
      ctx.patchState({testnet: Boolean(+action.config.testnet)});
    }
  }
};


@State<AppStateModel>({
  name: APP_STATE_TOKEN,
  defaults: {
    isConnected: false,
    appMode: null,
    loadingMessage: ''
  },
  children: [CoreConnectionState]
})
export class ApplicationState {


  @Selector([ApplicationState, CoreConnectionState])
  static connectionDetails(appState: AppStateModel, coreState: CoreConnectionModel) {
    return {
      connected: appState.isConnected,
      rpcHostname: coreState.rpcbind,
      rpcPort: coreState.port,
      rpcAuth: coreState.auth
    } as ConnectionDetails
  }


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

  @Action(Global.Connected)
  setConnected(ctx: StateContext<AppStateModel>) {
    return ctx.dispatch(new Global.ChangeMode(null)).pipe(
      tap(() => {
        ctx.patchState({isConnected: true})
      })
    )
  }

  @Action(Global.ChangeMode)
  changeApplicationMode(ctx: StateContext<AppStateModel>, {mode}: Global.ChangeMode) {
    let checkedMode: APP_MODE;
    if (mode === null) {
      // force the read from settings storage
      const storedMode = localStorage.getItem('settings.app_mode') || '';
      if (APP_MODE[storedMode]) {
        checkedMode = APP_MODE[storedMode];
      }
    } else if (APP_MODE[mode]) {
      checkedMode = mode;
    }

    if (!checkedMode) {
      checkedMode = APP_MODE.WALLET;
    }

    localStorage.setItem('settings.app_mode', APP_MODE[checkedMode]);
    ctx.patchState({appMode: checkedMode});
  }

};
