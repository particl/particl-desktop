import {
  State,
  StateToken,
  Action,
  StateContext,
  NgxsModuleOptions,
  Selector,
} from '@ngxs/store';
import { environment } from 'environments/environment';

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
import { ZmqConnectionState } from './zmq-connection.state';


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
    appMode: null,
    loadingMessage: ''
  },
  children: [CoreConnectionState, AppSettingsState, AppDataState, ZmqConnectionState]
})
export class ApplicationState {


  @Selector([CoreConnectionState, AppSettingsState])
  static appSettings(coreState: CoreConnectionModel, settingState: AppSettingsStateModel) {
    return {
      proxy: coreState.proxy,
      upnp: coreState.upnp,
      language: settingState.language,
    } as SettingsViewModel;
  }


  @Selector()
  static appMode(state: AppStateModel) {
    return state.appMode;
  }


  constructor() {}


  // @Action(Global.SetLoadingMessage)
  // setApplicationLoadingMessage(ctx: StateContext<AppStateModel>, action: Global.SetLoadingMessage) {
  //   ctx.patchState({
  //     loadingMessage: action.message
  //   });
  // }


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

}
