import { Injectable } from '@angular/core';
import {
  State,
  NgxsModuleOptions,
  Action,
  StateContext,
  createSelector,
  Selector,
} from '@ngxs/store';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import { catchError, tap, take } from 'rxjs/operators';
import { BackendService } from '../services/backend.service';

import { GlobalActions } from './app.actions';
import { ApplicationConfigStateModel, IPCResponseApplicationSettings } from './state.models';
import { APP_CONFIG_STATE_TOKEN, APP_STATE_TOKEN } from '../state.tokens';


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


@State({
  name: APP_CONFIG_STATE_TOKEN,
  defaults: {
    appModules: null,
    buildMode: null,
    debugLevel: null,
    requestedTestingNetworks: false,
    selectedLanguage: '',
    newAppVersionAvailable: false,
  },
  children: []
})
@Injectable()
export class ApplicationConfigState {

  @Selector()
  static hasNewAppVersion(state: ApplicationConfigStateModel) {
    return state.newAppVersionAvailable;
  }


  static moduleVersions(module: keyof IPCResponseApplicationSettings['VERSIONS'] | undefined) {
    return createSelector(
      [APP_CONFIG_STATE_TOKEN],
      (appState: ApplicationConfigStateModel): string =>
        appState.appModules && module && appState.appModules[module] ? appState.appModules[module] : ''
    );
  }


  private isInitialized: boolean = false;


  constructor(private backendService: BackendService) { }


  @Action(GlobalActions.Initialize)
  initializeApplicationConfiguration(ctx: StateContext<ApplicationConfigStateModel>) {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // establish version update listener... no need to unsubscribe as it needs to persist throughtout the application session
    this.backendService.listen<boolean>('application:versionCheck').pipe(
      catchError(() => of(false)),
      tap({
        next: (hasUpdatedVersion) => {
          if (typeof hasUpdatedVersion === 'boolean' && ctx.getState().newAppVersionAvailable !== hasUpdatedVersion) {
            ctx.patchState({newAppVersionAvailable: hasUpdatedVersion});
          }
        }
      })
    ).subscribe();

    return this.backendService.sendAndWait<IPCResponseApplicationSettings>('application:settings').pipe(
      take(1),
      catchError((e) => of({} as IPCResponseApplicationSettings)),
      tap((values) => {
        const patchItems: Partial<ApplicationConfigStateModel> = {};
        if (typeof values.DEBUGGING_LEVEL === 'string') { patchItems.debugLevel = values.DEBUGGING_LEVEL; }
        if (typeof values.MODE === 'string') { patchItems.buildMode = values.MODE; }
        if (typeof values.TESTING_MODE === 'boolean') { patchItems.requestedTestingNetworks = values.TESTING_MODE; }
        if (typeof values.VERSIONS === 'object') { patchItems.appModules = values.VERSIONS; }
        if (typeof values.LANGUAGE === 'string') { patchItems.selectedLanguage = values.LANGUAGE; }

        if (Object.keys(patchItems).length > 0) {
          ctx.patchState(patchItems);
        }
      }),
    );
  }


  @Action(GlobalActions.SetSetting)
  setApplicationSetting(ctx: StateContext<ApplicationConfigStateModel>, { key, newvalue}: GlobalActions.SetSetting) {
    const currentState = ctx.getState();
    if ((key in currentState) && ['debugLevel', 'selectedLanguage'].includes(key) && typeof newvalue === typeof currentState[key]) {
      ctx.patchState({ [key]: newvalue});
    }
  }
}


@State({
  name: APP_STATE_TOKEN,
  defaults: {},
  children: [ApplicationConfigState]
})
export class ApplicationState {

  constructor() {}

}
