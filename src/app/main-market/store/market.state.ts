import { State, StateToken, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { of, defer, iif } from 'rxjs';
import { tap, catchError, concatMap, retryWhen, map, mapTo } from 'rxjs/operators';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { SettingsService } from 'app/core/services/settings.service';
import { MarketActions } from './market.actions';
import { MarketStateModel, StartedStatus, ProfileResp, Identity, IdentityResp, MarketSettings } from './market.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { MainActions } from 'app/main/store/main.actions';


const MARKET_STATE_TOKEN = new StateToken<MarketStateModel>('market');


@State<MarketStateModel>({
  name: MARKET_STATE_TOKEN,
  defaults: {
    started: StartedStatus.STOPPED,
    profile: null,
    identities: [],
    identity: null,
    settings: {
      port: 3000,
      defaultIdentityID: 0,
      defaultProfileID: 0
    }
  }
})
export class MarketState implements NgxsOnInit {

  @Selector()
  static startedStatus(state: MarketStateModel): StartedStatus {
    return state.started;
  }


  @Selector()
  static currentIdentity(state: MarketStateModel): Identity {
    return state.identity !== null ? state.identity : { id: -1, name: '-', displayName: '-', icon: '', path: '' };
  }


  @Selector()
  static filteredIdentitiesList(state: MarketStateModel): Identity[] {
    if (state.identity === null) { return state.identities; }
    return state.identities.filter(id => id.id !== state.identity.id);
  }


  @Selector()
  static settings(state: MarketStateModel): MarketSettings {
    return state.settings;
  }


  constructor(
    private _marketService: MarketRpcService,
    private _settingsService: SettingsService
  ) {}


  ngxsOnInit(ctx: StateContext<MarketStateModel>) {
    const storedSettings = this._settingsService.fetchMarketSettings();
    const stateSettings = ctx.getState().settings;

    const newStateSettings = JSON.parse(JSON.stringify(stateSettings));

    const stateKeys = Object.keys(stateSettings);
    for (const key of stateKeys) {
      if (typeof storedSettings[key] === typeof stateSettings[key] ) {
        newStateSettings[key] = storedSettings[key];
      }
    }

    ctx.patchState({settings: newStateSettings});
  }


  @Action(MarketActions.StartMarketService)
  startMarketServices(ctx: StateContext<MarketStateModel>) {
    if ([StartedStatus.PENDING, StartedStatus.STARTED].includes(ctx.getState().started)) {
      return;
    }

    ctx.patchState({started: StartedStatus.PENDING});

    const failed$ = defer(() => {
      this._marketService.stopMarketService();
      const status = ctx.getState().started;
      if ([StartedStatus.PENDING, StartedStatus.STARTED].includes(status)) {
        ctx.patchState({started: StartedStatus.STOPPED});
      }
    });

    const profile$ = defer(() => {
      const savedProfileId = +ctx.getState().settings.defaultProfileID;

      return this._marketService.call('profile', ['list']).pipe(
        retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 5})),
        catchError(() => of([])),
        concatMap((profileList: ProfileResp[]) => {
          if (savedProfileId > 0) {
            const found = profileList.find(profileItem => profileItem.id === savedProfileId);
            if (found !== undefined) {
              ctx.patchState({profile: {id: found.id, name: found.name}});
              return of(true);
            }
          }

          // no saved profile -OR- previously saved profile doesn't exist anymore -> revert to loading the default profile
          const defaultProfile = profileList.find(profileItem => profileItem.name === 'DEFAULT');
          if (defaultProfile !== undefined) {
            ctx.patchState({profile: {id: defaultProfile.id, name: defaultProfile.name}});
            return of(true);
          }

          // no default profile?? Something's not right, so bail...
          return failed$.pipe(mapTo(false));
        })
      );
    });

    return this._marketService.startMarketService(ctx.getState().settings.port).pipe(
      catchError((err) => {
        ctx.patchState({started: StartedStatus.FAILED});
        return of(false);
      }),
      concatMap((isStarted: boolean) => iif(() => isStarted, profile$, failed$)),
      tap((isSuccess) => {
        if (isSuccess) {
          ctx.patchState({started: StartedStatus.STARTED});
          ctx.dispatch(new MarketActions.LoadIdentities());
        }
      })
    );
  }


  @Action(MarketActions.StopMarketService)
  stopMarketServices(ctx: StateContext<MarketStateModel>) {
    this._marketService.stopMarketService();
    ctx.patchState({started: StartedStatus.STOPPED});
  }


  @Action(MarketActions.LoadIdentities)
  loadMarketIdentities(ctx: StateContext<MarketStateModel>) {
    const state = ctx.getState();
    if (state.started === StartedStatus.STARTED) {
      const profileId = state.profile.id;

      return this._marketService.call('identity', ['list', profileId]).pipe(
        retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 3})),
        catchError(() => of([])),
        map((identityList: IdentityResp[]) => {
          const ids: Identity[] = [];
          identityList.forEach((idItem: IdentityResp) => {
            if (idItem.type === 'MARKET') {
              const idName = String(idItem.wallet.split(`${state.profile.name}/`)[1]);
              ids.push({
                name: idName,
                displayName: idName,
                icon: idName[0],
                path: idItem.wallet,
                id: idItem.id
              });
            }
          });

          return ids;
        }),

        tap(identities => {
          ctx.patchState({identities});

          if (identities.length > 0) {
            const selectedIdentity = ctx.getState().identity;

            if (selectedIdentity) {
              const found = identities.find(id => id.id === selectedIdentity.id);
              if (found !== undefined) {
                // current selected identity is in the list so nothing to do.
                return;
              }
            }

            // Selected identity is not in the list returned, or there is no selected identity
            const savedID = ctx.getState().settings.defaultIdentityID;

            if (savedID) {
              const saved = identities.find(id => id.id === savedID);
              if (saved !== undefined) {
                ctx.dispatch(new MarketActions.SetCurrentIdentity(saved));
                return;
              }
            }

            // No valid current identity and no saved identity... get first identity from list
            const selected = identities.sort((a, b) => a.id - b.id)[0];
            ctx.dispatch(new MarketActions.SetCurrentIdentity(selected));
          } else {
            ctx.dispatch(new MarketActions.SetCurrentIdentity(null));
          }
        })
      );
    }
  }


  @Action(MarketActions.SetCurrentIdentity)
  setActiveIdentity(ctx: StateContext<MarketStateModel>, { identity }: MarketActions.SetCurrentIdentity) {
    if (identity === null || (Number.isInteger(+identity.id) && (+identity.id > 0))) {
      return ctx.dispatch(new MainActions.ChangeWallet(identity.path)).pipe(
        tap(() => ctx.patchState({identity}))
      );
    }
  }


  @Action(MarketActions.SetSetting)
  changeMarketSetting(ctx: StateContext<MarketStateModel>, action: MarketActions.SetSetting) {
    const currentState = JSON.parse(JSON.stringify(ctx.getState().settings));

    if ( Object.keys(currentState).includes(action.key) && (typeof currentState[action.key] === typeof action.value) ) {
      if (this._settingsService.saveMarketSetting(action.key, action.value)) {
        currentState[action.key] = action.value;
        ctx.patchState({settings: currentState});
      }
    }
  }

}
