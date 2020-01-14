import {
  State,
  StateToken,
  Action,
  StateContext,
  Selector,
} from '@ngxs/store';
import { environment } from 'environments/environment';

import { Global, AppSettings } from './app.actions';
import {
  CoreConnectionModel, ConnectionDetails
} from './app.models';
import { IpcService } from '../services/ipc.service';
import { RpcService } from '../services/rpc.service';


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


  constructor(
    private _ipcService: IpcService,
    private _rpcService: RpcService
  ) {}


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

    const appState = ctx.getState();

    const connDetails = {
      rpcHostname: appState.rpcbind,
      rpcPort: appState.port,
      rpcAuth: appState.auth
    } as ConnectionDetails;

    this._rpcService.setConnectionDetails(connDetails);
  }


  @Action(AppSettings.SetSetting)
  setCoreSetting(ctx: StateContext<CoreConnectionModel>, action: AppSettings.SetSetting) {
    if (action.setting.startsWith('core.network.')) {
      const key = action.setting.replace('core.network.', '');
      const currentState = ctx.getState();
      if ( Object.keys(currentState).includes(key) && (typeof currentState[key] === typeof action.value)) {
        const obj = {};
        obj[key] = action.value;
        ctx.patchState(obj);
        this._ipcService.runCommand('write-core-config', null, obj);
      }
    }
  }
};
