import { State, StateToken, Action, StateContext, Selector } from '@ngxs/store';
import { of, defer, iif, timer, throwError } from 'rxjs';
import { tap, catchError, concatMap, retryWhen, map, mapTo } from 'rxjs/operators';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { MarketSocketService } from '../services/market-rpc/market-socket.service';
import { SettingsService } from 'app/core/services/settings.service';
import { MarketActions } from './market.actions';
import { MarketStateModel, StartedStatus, Identity, MarketSettings, Profile, CartDetail, DefaultMarketConfig } from './market.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { MainActions } from 'app/main/store/main.actions';
import { RespProfileListItem, RespIdentityListItem } from '../shared/market.models';
import { environment } from 'environments/environment';
import { isBasicObjectType, getValueOrDefault } from '../shared/utils';


const MARKET_STATE_TOKEN = new StateToken<MarketStateModel>('market');


const DEFAULT_STATE_VALUES: MarketStateModel = {
  started: StartedStatus.STOPPED,
  profile: null,
  identities: [],
  identity: null,
  defaultConfig: {
    imagePath: './assets/images/placeholder_4-3.jpg',
    url: `http://${environment.marketHost}:${environment.marketPort || 80}/`,
    imageMaxSizeFree: 153600,  // 150 KB
    imageMaxSizePaid: 1_048_576 // 1 MB
  },
  settings: {
    port: environment.marketPort,
    defaultIdentityID: 0,
    defaultProfileID: 0,
    userRegion: '',
    canModifyIdentities: false,
    useAnonBalanceForFees: false,
    usePaidMsgForImages: true,
    startupWaitTimeoutSeconds: 60
  }
};


const NULL_IDENTITY: Identity = { id: 0, name: '-', displayName: '-', address: '', icon: '', path: '', carts: [] };


@State<MarketStateModel>({
  name: MARKET_STATE_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES))
})
export class MarketState {

  /**
     * NB!!!! Once the Market state is loaded into the global store, it remains there permanently through the running of the application.
     * Which means:
     *
     * 1. Keep this as light-weight as possible:
     *    - do not store anything here that is not imperative for general MP operation;
     *    - make certain that there is exactly that which is needed (if certain circumstances require additional info, load it as needed);
     *    - if in doubt, don't store it;
     *    - ensure that there is nothing sensitive left in as part of the default store state.
     *
     * 2. If using ngxsOnInit(), remember that it is called only the first time the state is added to the global store!
     *    - So despite the market module potentially being "loaded" multuple times, this function will only execute on the 1st market load.
     *    - for clean separation, we should be bootstrapping this market module as another whole app inside the main application...
     *      We'll get to such a goal eventually... or at least thats the current foward direction.
     */

  @Selector()
  static startedStatus(state: MarketStateModel): StartedStatus {
    return state.started;
  }


  @Selector()
  static currentIdentity(state: MarketStateModel): Identity {
    return state.identity !== null ? state.identity : JSON.parse(JSON.stringify(NULL_IDENTITY));
  }


  @Selector()
  static currentProfile(state: MarketStateModel): Profile {
    const nullProfile: Profile = { id: 0, name: '-'};
    return state.profile !== null ? state.profile : nullProfile;
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


  @Selector()
  static defaultConfig(state: MarketStateModel): DefaultMarketConfig {
    return state.defaultConfig;
  }


  @Selector()
  static availableCarts(state: MarketStateModel): CartDetail[] {
    return state.identity === null ? [] : state.identity.carts;
  }


  constructor(
    private _marketService: MarketRpcService,
    private _socketService: MarketSocketService,
    private _settingsService: SettingsService
  ) {}


  @Action(MarketActions.StartMarketService)
  startMarketServices(ctx: StateContext<MarketStateModel>) {
    if ([StartedStatus.PENDING, StartedStatus.STARTED].includes(ctx.getState().started)) {
      return;
    }

    this.loadSettings(ctx);

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
        concatMap((profileList: RespProfileListItem[]) => {
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
    }).pipe(
      tap((isSuccess) => {
        if (isSuccess) {
          this.loadSettings(ctx, ctx.getState().profile.id);
        }
      }),
      concatMap((isSuccess) => iif(
          () => isSuccess,

          defer(() => {
            return ctx.dispatch(new MarketActions.LoadIdentities()).pipe(tap(() => ctx.patchState({started: StartedStatus.STARTED})));
          })
      ))
    );

    const currentSettings = ctx.getState().settings;

    return this._marketService.startMarketService(currentSettings.port, currentSettings.startupWaitTimeoutSeconds).pipe(
      map(resp => {
        const defaultConfig: DefaultMarketConfig = JSON.parse(JSON.stringify(ctx.getState().defaultConfig));
        defaultConfig.url = resp.url ? resp.url : defaultConfig.url;
        ctx.patchState({defaultConfig});
        return resp.started;
      }),
      tap((isStarted) => {
        if (isStarted) {
          // the path appended here is necessary since the marketplace is using socket.io and this is needed specifically for socket.io
          let url = `${ctx.getState().defaultConfig.url}socket.io/?EIO=3&transport=websocket`;

          if (url.startsWith('http')) {
            url = url.replace('http', 'ws');
          }
          this._socketService.startSocketService(url);
        }
      }),
      catchError((err) => {
        ctx.patchState({started: StartedStatus.FAILED});
        return of(false);
      }),
      concatMap((isStarted: boolean) => iif(
        () => !isStarted,
        failed$,
        profile$
      ))
    );
  }


  @Action(MarketActions.StopMarketService)
  stopMarketServices(ctx: StateContext<MarketStateModel>) {
    this._marketService.stopMarketService();
    this._socketService.stopSocketService();
    ctx.setState(JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES)));
  }


  @Action(MarketActions.RestartMarketService)
  restartMarketServices(ctx: StateContext<MarketStateModel>) {
    return ctx.dispatch(new MarketActions.StopMarketService()).pipe(
      concatMap(() => timer(1500).pipe(tap(() => ctx.dispatch(new MarketActions.StartMarketService()))))
    );
  }


  @Action(MarketActions.LoadIdentities)
  loadIdentities(ctx: StateContext<MarketStateModel>) {
    const state = ctx.getState();
    if ((state.started === StartedStatus.STARTED) || (state.started === StartedStatus.PENDING)) {
      const profileId = state.profile.id;

      return this._marketService.call('identity', ['list', profileId]).pipe(
        retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 3})),
        catchError(() => of([])),
        map((identityList: RespIdentityListItem[]) => {
          const ids: Identity[] = [];
          identityList.forEach((idItem: RespIdentityListItem) => {
            const id = this.buildIdentityItem(idItem, state.profile.name);
            if (id.id > 0) {
              ids.push(id);
            }
          });

          return ids;
        }),

        tap(identities => {
          ctx.patchState({identities});
        }),

        concatMap((identities) => {
          if (identities.length > 0) {
            const selectedIdentity = ctx.getState().identity;

            if (selectedIdentity !== null) {
              const found = identities.find(id => id.id === selectedIdentity.id);
              if (found !== undefined) {
                // current selected identity is in the list so nothing to do: its already selected
                return of(null);
              }
            }

            // Selected identity is not in the list returned, or there is no selected identity
            const savedID = ctx.getState().settings.defaultIdentityID;

            if (savedID) {
              const saved = identities.find(id => id.id === savedID);
              if (saved !== undefined) {
                return ctx.dispatch(new MainActions.ChangeWallet(saved.name)).pipe(
                  concatMap(() => ctx.dispatch(new MarketActions.SetCurrentIdentity(saved)))
                );
              }
            }


            // MP is starting up, no valid current nor default identity is set.
            //    So check if the current "global" wallet is set AND is a market related wallet
            const globalSettings = this._settingsService.fetchGlobalSettings();
            if ((typeof globalSettings.activatedWallet === 'string') && (globalSettings.activatedWallet.length > 0)) {
              const savedName = globalSettings.activatedWallet;
              const saved = identities.find(id => id.name === savedName);
              if (saved) {
                return ctx.dispatch(new MainActions.ChangeWallet(saved.name)).pipe(
                  concatMap(() => ctx.dispatch(new MarketActions.SetCurrentIdentity(saved)))
                );
              }
            }

            // No valid current identity and no saved identity... get first identity from list
            const selected = identities.sort((a, b) => a.id - b.id)[0];
            return ctx.dispatch(new MainActions.ChangeWallet(selected.name)).pipe(
              concatMap(() => ctx.dispatch(new MarketActions.SetCurrentIdentity(selected)))
            );
          } else {
            return ctx.dispatch(new MarketActions.SetCurrentIdentity(NULL_IDENTITY));
          }
        })
      );
    }
  }


  @Action(MarketActions.SetCurrentIdentity)
  setActiveIdentity(ctx: StateContext<MarketStateModel>, { identity }: MarketActions.SetCurrentIdentity) {

    if (identity && (Number.isInteger(+identity.id))) {
      const globalSettings = this._settingsService.fetchGlobalSettings();
      // TODO: not a great way to do this... but we need to verify that the application state wallet is the current wallet
      //  before setting the active identity to that wallet. Look into a better way of doing this...
      if (globalSettings['activatedWallet'] === identity.name) {
        ctx.patchState({identity});
      }
    } else {
      ctx.patchState({identity: NULL_IDENTITY});
    }
  }


  @Action(MarketActions.CreateMarketIdentity)
  createMarketIdentity(ctx: StateContext<MarketStateModel>, { identityName }: MarketActions.CreateMarketIdentity) {

    if (typeof identityName !== 'string' && !identityName) {
      return throwError(() => of('Invalid Identity Name'));
    }

    const state = ctx.getState();

    if (state.started !== StartedStatus.STARTED) {
      return throwError(() => of('Market Not Started'));
    }

    const profileId = state.profile.id;

    return this._marketService.call('identity', ['add', profileId, identityName]).pipe(
      tap((identityResp: RespIdentityListItem) => {
        const newId = this.buildIdentityItem(identityResp, state.profile.name);
        if ((newId.id > 0) && (ctx.getState().profile.id === profileId)) {
          ctx.patchState({ identities: [...ctx.getState().identities, newId]});
        }
      })
    );
  }


  @Action(MarketActions.SetSetting)
  changeMarketSetting(ctx: StateContext<MarketStateModel>, action: MarketActions.SetSetting) {
    const currentState = ctx.getState();
    const currentSettings = JSON.parse(JSON.stringify(currentState.settings));
    let key = action.key;
    let profileID: number;

    if (key.startsWith('profile.')) {
      // Save settings for the current Profile
      key = key.replace('profile.', '');
      if (currentState.profile !== null) {
        profileID = currentState.profile.id;
      }
    }

    if ( Object.keys(currentSettings).includes(key) && (typeof currentSettings[key] === typeof action.value) ) {
      if (this._settingsService.saveMarketSetting(key, action.value, profileID)) {
        currentSettings[key] = action.value;
        ctx.patchState({settings: currentSettings});
      }
    }
  }


  private loadSettings(ctx: StateContext<MarketStateModel>, profileId?: number) {

    const stateSettings = ctx.getState().settings;
    const newStateSettings: MarketSettings = JSON.parse(JSON.stringify(stateSettings));
    const stateKeys = Object.keys(newStateSettings);

    if (typeof profileId === 'number') {
      const storedProfile = this._settingsService.fetchMarketSettings(profileId);
      for (const key of stateKeys) {
        if (typeof storedProfile[key] === typeof stateSettings[key] ) {
          newStateSettings[key] = storedProfile[key];
        }
      }
    } else {
      const storedSettings = this._settingsService.fetchMarketSettings();

      for (const key of stateKeys) {
        if (typeof storedSettings[key] === typeof stateSettings[key] ) {
          newStateSettings[key] = storedSettings[key];
        }
      }
    }

    ctx.patchState({settings: newStateSettings});
  }


  private buildIdentityItem(src: RespIdentityListItem, profileName: string): Identity {
    const newItem: Identity = {
      id: 0,
      name: '',
      displayName: '',
      icon: '',
      address: '',
      carts: [],
      path: ''
    };

    if (!isBasicObjectType(src)) {
      return newItem;
    }

    if (src.type === 'MARKET') {
      newItem.name = getValueOrDefault(src.wallet, 'string', newItem.name);
      if (profileName) {
        const parts = newItem.name.split(`${profileName}/`);
        if (parts.length >= 2) {
          newItem.displayName = parts[1];
        } else {
          newItem.displayName = name;
        }
      }

      newItem.icon = newItem.displayName[0];
      newItem.address = getValueOrDefault(src.address, 'string', newItem.address);

      if (Array.isArray(src.ShoppingCarts)) {
        src.ShoppingCarts.forEach(cart => {
          if (isBasicObjectType(cart) && (+cart.id > 0)) {
            newItem.carts.push({id: +cart.id, name: typeof cart.name === 'string' ? cart.name : ''});
          }
        });
      }

      newItem.id = +src.id > 0 ? +src.id : newItem.id;
    }

    return newItem;

  }

}
