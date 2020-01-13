import {
  State,
  StateToken,
  Action,
  StateContext,
  NgxsModuleOptions,
  Selector,
  NgxsOnInit
} from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

import { ConnectionService } from 'app/core/services/connection.service';
import { SettingsService } from 'app/core/services/settings.service';

import { Global, AppSettings } from './app.actions';
import { AppStateModel, CoreConnectionModel, AppSettingsModel, APP_MODE, ConnectionDetails, SettingsViewModel } from './app.models';
import { IpcService } from '../services/ipc.service';


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


const CORE_CONFIG_TOKEN = new StateToken<CoreConnectionModel>('coreconnection');
const APP_SETTINGS_TOKEN = new StateToken<CoreConnectionModel>('settings');
const APP_STATE_TOKEN = new StateToken<AppStateModel>('global');


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
    private _ipcService: IpcService
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


@State<AppSettingsModel>({
  name: APP_SETTINGS_TOKEN,
  defaults: {
    activatedWallet: '',
    language: 'en-us',
    marketActive: false
  }
})
export class AppSettingsState implements NgxsOnInit {


  @Selector()
  static activeWallet(appState: AppSettingsModel) {
    return appState.activatedWallet;
  }


  constructor(
    private _settings: SettingsService
  ) {}

  ngxsOnInit(ctx: StateContext<AppSettingsModel>) {
    const saved = this._settings.fetchGlobalSettings();
    const current = ctx.getState();

    for (const key of Object.keys(saved)) {
      if ( (key in current) && (typeof saved[key] === typeof current[key]) ) {
        current[key] = saved[key];
      }
    }

    ctx.patchState({
      ...current
    });
  }


  @Action(AppSettings.SetSetting)
  setGlobalAppSetting(ctx: StateContext<AppStateModel>, action: AppSettings.SetSetting) {
    const currentState = ctx.getState();
    const parts = action.setting.split('.', 2);
    if (parts[0] === 'global' && Object.keys(currentState).includes(parts[1]) && (typeof currentState[parts[1]] === action.value) ) {
      const obj = {};
      obj[parts[1]] = action.value;
      ctx.patchState(obj);
    }
  }
}


@State<AppStateModel>({
  name: APP_STATE_TOKEN,
  defaults: {
    isConnected: false,
    appMode: null,
    loadingMessage: ''
  },
  children: [CoreConnectionState, AppSettingsState]
})
export class ApplicationState implements NgxsOnInit {


  @Selector([ApplicationState, CoreConnectionState])
  static connectionDetails(appState: AppStateModel, coreState: CoreConnectionModel) {
    return {
      connected: appState.isConnected,
      rpcHostname: coreState.rpcbind,
      rpcPort: coreState.port,
      rpcAuth: coreState.auth
    } as ConnectionDetails
  }


  @Selector([CoreConnectionState, AppSettingsState])
  static appSettings(coreState: CoreConnectionModel, settingState: AppSettingsModel) {
    return {
      proxy: coreState.proxy,
      upnp: coreState.upnp,
      language: settingState.language,
      marketActive: settingState.marketActive
    } as SettingsViewModel
  }


  @Selector()
  static appMode(state: AppStateModel) {
    return state.appMode;
  }


  constructor(
    private _connectionService: ConnectionService
  ) {}


  ngxsOnInit() {
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
      const storedMode = localStorage.getItem('app.app_mode') || '';
      if (APP_MODE[storedMode]) {
        checkedMode = APP_MODE[storedMode];
      }
    } else if (APP_MODE[mode]) {
      checkedMode = mode;
    }

    if (!checkedMode) {
      checkedMode = APP_MODE.WALLET;
    }

    localStorage.setItem('app.app_mode', APP_MODE[checkedMode]);
    ctx.patchState({appMode: checkedMode});
  }


  // @Action(Global.UpdateWallets)
  // setWalletsAvailable(ctx: StateContext<AppStateModel>, { newWallets }: Global.UpdateWallets) {
  //   const currentWallets = ctx.getState().walletsAvailable;
  //   let isDiff = false;

  //   const cwMax = currentWallets.length;
  //   const nwMax = newWallets.length;

  //   if (nwMax !== cwMax) {
  //     isDiff = true;
  //   } else {
  //     const max = nwMax;
  //     for (let i = 0; i < max; ++i) {
  //       if (i < cwMax) {
  //         isDiff = isDiff && newWallets.findIndex(w => w.name === currentWallets[i].name) === -1;
  //       }

  //       if (!isDiff && i < nwMax) {
  //         isDiff = isDiff && currentWallets.findIndex(w => w.name === newWallets[i].name) === -1;
  //       }

  //       if (!isDiff) {
  //         break;
  //       }
  //     }
  //   }

  //   if (isDiff) {
  //     ctx.patchState({walletsAvailable: newWallets})
  //   }
  // }

};
