import { Injectable } from '@angular/core';
import {
  State,
  NgxsModuleOptions,
  Action,
  StateContext,
  createSelector,
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
    selectedLanguage: ''
  },
  children: []
})
@Injectable()
export class ApplicationConfigState {

  static moduleVersions(module: string | undefined) {
    return createSelector(
      [APP_CONFIG_STATE_TOKEN],
      (appState: ApplicationConfigStateModel): string =>
        appState.appModules && module && appState.appModules[module] ? appState.appModules[module] : ''
    );
  }


  constructor(private backendService: BackendService) { }


  @Action(GlobalActions.Initialize)
  initializeApplicationConfiguration(ctx: StateContext<ApplicationConfigStateModel>) {
    return this.backendService.sendAndWait<IPCResponseApplicationSettings>('application:settings').pipe(
      take(1),
      catchError((e) => of({} as IPCResponseApplicationSettings)),
      tap((values) => {
        const patchItems: Partial<ApplicationConfigStateModel> = {};
        if (typeof values.DEBUGGING_LEVEL === 'string') patchItems.debugLevel = values.DEBUGGING_LEVEL;
        if (typeof values.MODE === 'string') patchItems.buildMode = values.MODE;
        if (typeof values.TESTING_MODE === 'boolean') patchItems.requestedTestingNetworks = values.TESTING_MODE;
        if (typeof values.VERSIONS === 'object') patchItems.appModules = values.VERSIONS;
        if (typeof values.LANGUAGE === 'string') patchItems.selectedLanguage = values.LANGUAGE;

        if (Object.keys(patchItems).length > 0) {
          ctx.patchState(patchItems);
        }
      }),
    );
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
