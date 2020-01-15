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

import { Global  } from './app.actions';
import {
  AppStateModel,
  CoreConnectionModel,
  AppSettingsStateModel,
  APP_MODE,
  SettingsViewModel
} from './app.models';

import { AppSettingsState } from './appsettings.state';
import { CoreConnectionState } from './coreconnection.state';
import { AppDataState } from './appdata.state';


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


@State<AppStateModel>({
  name: APP_STATE_TOKEN,
  defaults: {
    isConnected: false,
    appMode: null,
    loadingMessage: ''
  },
  children: [CoreConnectionState, AppSettingsState, AppDataState]
})
export class ApplicationState implements NgxsOnInit {


  @Selector([CoreConnectionState, AppSettingsState])
  static appSettings(coreState: CoreConnectionModel, settingState: AppSettingsStateModel) {
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
