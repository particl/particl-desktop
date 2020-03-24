import { State, StateToken, Action, StateContext, Selector } from '@ngxs/store';
import { of, defer, iif } from 'rxjs';
import { tap, catchError, concatMap, retryWhen, map, mapTo } from 'rxjs/operators';
import { MarketService } from '../services/market-rpc/market.service';
import { SettingsService } from 'app/core/services/settings.service';
import { MarketActions } from './market.actions';
import { MarketStateModel, StartedStatus, ProfileResp, Identity, IdentityResp } from './market.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { MainActions } from 'app/main/store/main.actions';


const MARKET_STATE_TOKEN = new StateToken<MarketStateModel>('market');


@State<MarketStateModel>({
  name: MARKET_STATE_TOKEN,
  defaults: {
    started: StartedStatus.STOPPED,
    profile: null,
    identities: [],
    identity: null
  }
})
export class MarketState {

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


  constructor(
    private _marketService: MarketService,
    private _settingsService: SettingsService
  ) {}


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
      const settings = this._settingsService.fetchMarketSettings();
      const savedProfileId = +settings.defaultProfile || 0;

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

          // no saved profile or previously saved profile doesn't exist anymore
          const defaultProfile = profileList.find(profileItem => profileItem.name === 'DEFAULT');
          if (defaultProfile !== undefined) {
            this._settingsService.saveMarketSetting('defaultProfile', defaultProfile.id);
            ctx.patchState({profile: {id: defaultProfile.id, name: defaultProfile.name}});
            return of(true);
          }

          // no default profile?? Something's not right, so bail...
          return failed$.pipe(mapTo(false));
        })
      );
    });

    return this._marketService.startMarketService().pipe(
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
            const settings = this._settingsService.fetchMarketSettings();
            const savedID = +settings.defaultID || 0;

            if (savedID) {
              const saved = identities.find(id => id.id === savedID);
              if (saved !== undefined) {
                ctx.dispatch(new MarketActions.SetCurrentIdentity(saved));
                return;
              }
            }

            // So no valid current identity and no saved identity... now get first identity from list
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
}
