import { of, defer, iif, timer, throwError, merge } from 'rxjs';
import { tap, catchError, concatMap, retryWhen, map, mapTo } from 'rxjs/operators';

import { State, StateToken, Action, StateContext, Selector, createSelector, Store } from '@ngxs/store';
import { patch, updateItem, removeItem, iif as nxgsIif } from '@ngxs/store/operators';
import { Particl } from 'app/networks/networks.module';
import { MarketStateActions, MarketUserActions } from './market.actions';

import { BackendService } from 'app/core/services/backend.service';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { MarketSocketService } from '../services/market-rpc/market-socket.service';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { isBasicObjectType, getValueOrDefault, parseMarketResponseItem } from '../shared/utils';
import { RespProfileListItem, RespIdentityListItem, RespChatChannelList } from '../shared/market.models';
import {
  MarketStateModel, StartedStatus, Identity, MarketSettings, Profile, CartDetail, DefaultMarketConfig,
  MarketNotifications, ChatNotifications, IPCResponses
} from './market.models';
import { ChatChannelType } from '../services/chats/chats.models';
import { WalletInfoStateModel } from 'app/networks/particl/particl.models';


const MARKET_STATE_TOKEN = new StateToken<MarketStateModel>('market');


const DEFAULT_STATE_VALUES: MarketStateModel = {
  started: StartedStatus.STOPPED,
  profile: null,
  identities: [],
  identity: 0,
  defaultConfig: {
    imagePath: './assets/images/placeholder_4-3.jpg',
    url: `http://localhost:45492/`,
    port: 45492,
    imageMaxSizeFree: 153_600,  // 150 KB
    imageMaxSizePaid: 1_048_576 // 1 MB
  },
  settings: {
    port: 45492,
    defaultIdentityID: 0,
    defaultProfileID: 0,
    userRegion: '',
    canModifyIdentities: false,
    useAnonBalanceForFees: false,
    usePaidMsgForImages: true,
    startupWaitTimeoutSeconds: 120,
    defaultListingCommentPageCount: 20,
    daysToNotifyListingExpired: 7,
    marketsLastAdded: 0,
    txUrl: '',
  },
  lastSmsgScanIssued: 0,
  notifications: {
    identityCartItemCount: 0,
    buyOrdersPendingAction: [],
    sellOrdersPendingAction: [],
    chatsUnread: {
      listings: [],
      orders: [],
    }
  },
};


const NULL_IDENTITY: Identity = { id: 0, name: '-', displayName: '-', address: '', icon: '', path: '', carts: [], markets: [] };


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
     *      We'll get to such a goal eventually... or at least that's the current forward direction.
     */

  @Selector()
  static startedStatus(state: MarketStateModel): StartedStatus {
    return state.started;
  }


  @Selector()
  static currentIdentity(state: MarketStateModel): Identity {
    return +state.identity ?
      state.identities.find(id => id.id === +state.identity) || JSON.parse(JSON.stringify(NULL_IDENTITY)) :
      JSON.parse(JSON.stringify(NULL_IDENTITY));
  }


  @Selector()
  static currentProfile(state: MarketStateModel): Profile {
    const nullProfile: Profile = { id: 0, name: '-', hasMnemonicSaved: false, walletPath: ''};
    return state.profile !== null ? state.profile : nullProfile;
  }

  @Selector()
  static currentProfileIdentities(state: MarketStateModel): Identity[] {
    return state.identities;
  }


  @Selector()
  static settings(state: MarketStateModel): MarketSettings {
    return state.settings;
  }


  static setting(key: keyof MarketSettings) {
    return createSelector([MarketState.settings], (state: MarketSettings) => {
      return state[key] || null;
    });
  }


  @Selector()
  static defaultConfig(state: MarketStateModel): DefaultMarketConfig {
    return state.defaultConfig;
  }


  @Selector()
  static availableCarts(state: MarketStateModel): CartDetail[] {
    return this.currentIdentity(state).carts;
  }


  @Selector()
  static getNotifications(state: MarketStateModel): MarketNotifications {
    return state.notifications;
  }


  @Selector()
  static lastSmsgScan(state: MarketStateModel): number {
    return state.lastSmsgScanIssued;
  }


  static notificationValue(key: string) {
    return createSelector([MarketState.getNotifications], (state: MarketNotifications) => {
      return state[key] || null;
    });
  }


  static orderCountNotification(key: 'buy' | 'sell') {
    return createSelector([MarketState.getNotifications], (state: MarketNotifications): number => {
      return key === 'buy' ? state.buyOrdersPendingAction.length : (key === 'sell' ? state.sellOrdersPendingAction.length : null);
    });
  }


  static chatUnreadCountNotification(key: 'listings' | 'orders' | 'all') {
    return createSelector([MarketState.notificationValue('chatsUnread')], (state: ChatNotifications): number => {
      switch (key) {
      case 'listings': return state.listings.length;
      case 'orders': return state.orders.length;
      case 'all': return Object.keys(state).reduce((prev: number, curr: string) => state[curr].length + prev, 0);
      default: return 0;
      }
    });
  }


  static unreadChatChannels(key: ChatChannelType) {
    return createSelector([MarketState.notificationValue('chatsUnread')], (state: ChatNotifications): string[] => {
      switch (key) {
      case ChatChannelType.LISTINGITEM: return state.listings;
      case ChatChannelType.ORDERITEM: return state.orders;
      default: return [];
      }
    });
  }


  constructor(
    private _marketService: MarketRpcService,
    private _socketService: MarketSocketService,
    private _backendService: BackendService,
    private _store: Store,
  ) {}


  @Action(MarketStateActions.StartMarketService)
  startMarketServices(ctx: StateContext<MarketStateModel>) {

    if ([StartedStatus.PENDING, StartedStatus.STARTED].includes(ctx.getState().started)) {
      return;
    }

    ctx.patchState({started: StartedStatus.PENDING});

    const failed$ = defer(() => ctx.dispatch(MarketStateActions.StopMarketService).pipe(
      tap({
        next: () => {
          if ([StartedStatus.PENDING, StartedStatus.STARTED].includes(ctx.getState().started)) {
            ctx.patchState({started: StartedStatus.STOPPED});
          }
        }
      })
    ));


    const profile$ = defer(() => {
      const savedDefaultProfileId = this.getSavedDefaultProfileID();

      return this._marketService.call('profile', ['list']).pipe(
        retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 3})),
        catchError(() => of([])),
        map((profileList: RespProfileListItem[]) => {
          const profiles: Profile[] = [];
          if (Array.isArray(profileList)) {
            profileList.forEach(p => {
              if (isBasicObjectType(p) && ((+p.profileId > 0) || (!('profileId' in p) && ('id' in p))) && (typeof p.name === 'string')) {
                profiles.push({
                  id: +p.profileId || +p.id,
                  name: p.name,
                  hasMnemonicSaved: (typeof p.mnemonic === 'string') && (p.mnemonic.length > 0),
                  walletPath: p.wallet
                });
              }
            });
          }
          return profiles;
        }),
        concatMap((profileList: Profile[]) => {
          let foundProfile: Profile;

          if (savedDefaultProfileId > 0) {
            foundProfile = profileList.find(profileItem => profileItem.id === savedDefaultProfileId);
          }

          // no saved profile -OR- previously saved profile doesn't exist anymore -> revert to loading the default profile
          if (!foundProfile) {
            foundProfile = profileList.find(profileItem => profileItem.name === 'DEFAULT');
          }

          if (foundProfile) {
            ctx.patchState({profile: foundProfile});
            ctx.setState(patch<MarketStateModel>({
              settings: patch<MarketSettings>({
                defaultProfileID: foundProfile.id,
              })
            }));
            return of(true);
          }

          // no default profile?? Something's not right, so bail...
          return failed$.pipe(mapTo(false));
        })
      );
    }).pipe(
      tap({
        next: (isProfileLoaded) => {
          if (isProfileLoaded) {
            const newStateSettings: MarketSettings = (JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES))).settings;
            const excludedKeys = ['defaultProfileID', 'port', 'txUrl'];

            const pSettings = this.getLocalProfileSettings(ctx.getState().profile.id);

            if (Object.keys(pSettings).length > 0) {
              const stateKeys = Object.keys(newStateSettings);
              stateKeys.forEach(sk => {
                if (typeof newStateSettings[sk] === typeof pSettings[sk]) {
                  newStateSettings[sk] = pSettings[sk];
                }
              });
            }

            const currentState = ctx.getState().settings;
            excludedKeys.forEach(ek => {
              newStateSettings[ek] = currentState[ek];
            });

            ctx.patchState({settings: newStateSettings});
          }
        }
      }),
      concatMap((isSuccess) => iif(
          () => isSuccess,

          defer(() => {
            return ctx.dispatch(new MarketStateActions.LoadIdentities()).pipe(tap(() => {
              if (!ctx.getState().identity) {
                ctx.patchState({ started: StartedStatus.FAILED });
                return;
              }
              ctx.patchState({ started: StartedStatus.STARTED });
            }));
          })
      ))
    );

    const started$ = defer(() => this._backendService.sendAndWait<IPCResponses.GetSettings>('apps:market:market:getSettings').pipe(
        map(backendSettings => {
          let success = false;

          if (isBasicObjectType(backendSettings)) {
            if (isBasicObjectType(backendSettings.network) && getValueOrDefault(backendSettings.network.port, 'number', 0) > 0) {
              success = true;

              const defaultUrlParts = ctx.getState().defaultConfig.url.split(':');
              defaultUrlParts[defaultUrlParts.length - 1] = `${backendSettings.network.port}/`;
              const defaultUrl = defaultUrlParts.join(':');
              ctx.setState(patch<MarketStateModel>({
                defaultConfig: patch<DefaultMarketConfig>({
                  url: defaultUrl
                }),
                settings: patch<MarketSettings>({
                  port: backendSettings.network.port,
                })
              }));

              this._marketService._setConnectionParams(defaultUrl);
            }

            if (isBasicObjectType(backendSettings.urls) && typeof backendSettings.urls.transaction === 'string') {
              ctx.setState(patch<MarketStateModel>({
                settings: patch<MarketSettings>({
                  txUrl: backendSettings.urls.transaction,
                })
              }));
            }
          }

          return success;
        }),

        catchError(() => of(false)),

        concatMap(success => iif(
          () => !success,
          failed$,
          defer(() => {
            let url = `${ctx.getState().defaultConfig.url}socket.io/?EIO=3&transport=websocket`;

            if (url.startsWith('http')) {
              url = url.replace('http', 'ws');
            }
            return merge(
              this._socketService.startSocketService(url),
              profile$
            );
          })
        ))
      )
    );

    return this._backendService.sendAndWait<boolean>('apps:market:market:start').pipe(
      catchError(() => {
        ctx.patchState({started: StartedStatus.FAILED});
        return of(false);
      }),
      concatMap((isStarted: boolean) => iif(
        () => !isStarted,
        failed$,
        started$
      ))
    );

  }


  @Action(MarketStateActions.StopMarketService)
  stopMarketServices(ctx: StateContext<MarketStateModel>) {
    this._socketService.stopSocketService();
    this._marketService._stopConnection();
    this._backendService.send('apps:market:market:stop');
    ctx.setState(JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES)));
  }


  @Action(MarketStateActions.RestartMarketService)
  restartMarketServices(ctx: StateContext<MarketStateModel>) {
    return ctx.dispatch(new MarketStateActions.StopMarketService()).pipe(
      concatMap(() => timer(1500).pipe(tap(() => ctx.dispatch(new MarketStateActions.StartMarketService()))))
    );
  }


  @Action(MarketStateActions.LoadIdentities)
  loadIdentities(ctx: StateContext<MarketStateModel>) {
    const state = ctx.getState();
    if (!((state.started === StartedStatus.STARTED) || (state.started === StartedStatus.PENDING))) {
      return;
    }
    const profileId = state.profile.id;

    return this._marketService.call('identity', ['list', profileId]).pipe(
      retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 3})),
      catchError(() => of([])),
      map((identityList: RespIdentityListItem[]) => {
        const ids: Identity[] = [];
        identityList.forEach((idItem: RespIdentityListItem) => {
          const id = this.buildIdentityItem(idItem, state.defaultConfig.url, state.defaultConfig.imagePath);
          if (id.id > 0) {
            ids.push(id);
          }
        });

        return ids;
      }),

      tap(identities => {
        ctx.patchState({ identities });
      }),

      concatMap((identities) => {
        if (identities.length === 0) {
          return ctx.dispatch(new MarketStateActions.SetCurrentIdentity(NULL_IDENTITY));
        }

        const selectedIdentity = ctx.getState().identity;

        if (selectedIdentity > 0) {
          const found = identities.find(id => id.id === +selectedIdentity);
          if (found !== undefined) {
            // current selected identity is in the list so nothing to do: its already selected
            return of(null);
          }
        }

        // Selected identity is not in the list returned, or there is no selected identity: attempt the default identity
        const savedID = ctx.getState().settings.defaultIdentityID;

        if (savedID) {
          const saved = identities.find(id => id.id === savedID);
          if (saved !== undefined) {
            return ctx.dispatch(new MarketStateActions.SetCurrentIdentity(saved));
          }
        }

        // No valid current identity and no saved identity... check if the current selected particl wallet is a valid identity
        const activeParticlWalletInfo = this._store.selectSnapshot<WalletInfoStateModel>(Particl.State.Wallet.Info);
        const current = identities.find(identity => identity.name === activeParticlWalletInfo.walletname);
        if (current) {
          return ctx.dispatch(new MarketStateActions.SetCurrentIdentity(current));
        }

        // whelp, nothing else worked: use first identity found from the marketplace (if it has any)
        const selected = JSON.parse(JSON.stringify(identities)).sort((a: Identity, b: Identity) => a.id - b.id)[0];
        if (selected) {
          return ctx.dispatch(new MarketStateActions.SetCurrentIdentity(selected));
        }

        // now bail... the null identity is the chosen one
      })
    );
  }


  @Action(MarketStateActions.SetCurrentIdentity, {cancelUncompleted: true})
  setActiveIdentity(ctx: StateContext<MarketStateModel>, { identity }: MarketStateActions.SetCurrentIdentity) {

    if (!(identity && (Number.isInteger(+identity.id)))) {
      return;
    }

    if (+identity.id > 0) {
      return ctx.dispatch(new Particl.Actions.WalletActions.ChangeWallet(identity.name)).pipe(
        map(() => true),
        catchError(() => of(false)),
        concatMap(isChanged => iif(
          () => isChanged,
          defer(() => {
            ctx.patchState({identity: +identity.id});
            return ctx.dispatch([
              new MarketStateActions.SetIdentityCartCount(),
              new MarketStateActions.ChatNotificationsClearAll()
            ]);
          }),
          defer(() => {})
        ))
      );
    }
    ctx.patchState({identity: 0});
  }


  @Action(MarketStateActions.SetIdentityCartCount, {cancelUncompleted: true})
  setActiveIdentityCartCount(ctx: StateContext<MarketStateModel>) {
    const identityCarts = MarketState.currentIdentity(ctx.getState()).carts;
    if (identityCarts.length > 0) {
      return this._marketService.call('cartitem', ['list', +identityCarts[0].id]).pipe(
        catchError(() => of([])),
        tap((cartItems) => {
          ctx.setState(patch<MarketStateModel>({
            notifications: patch<MarketNotifications>({
              identityCartItemCount: Array.isArray(cartItems) ? cartItems.length : 0
            })
          }));
        })
      );
    } else {
      ctx.setState(patch<MarketStateModel>({
        notifications: patch<MarketNotifications>({
          identityCartItemCount: 0
        })
      }));
    }
  }


  @Action(MarketStateActions.ChatNotificationsClearAll)
  chatNotificationsCleared(ctx: StateContext<MarketStateModel>, action: MarketStateActions.ChatNotificationsClearAll) {
    const identityId = ctx.getState().identity;

    if (identityId > 0) {
      return this._marketService.call('chat', ['channellist', identityId]).pipe(
        catchError(() => of({})),
        tap((resp: RespChatChannelList) => {
          let items = [];
          if (isBasicObjectType(resp) && !!resp.success && Array.isArray(resp.data)) {
            items = resp.data.filter(r =>
              (typeof r.channel === 'string')
              && r.channel.length > 0
              && !!r.has_unread
            );
          }
          ctx.setState(patch<MarketStateModel>({
            notifications: patch<MarketNotifications>({
              chatsUnread: patch<ChatNotifications>({
                listings: items.filter(i => i.channel_type === ChatChannelType.LISTINGITEM).map(i => i.channel),
                orders: items.filter(i => i.channel_type === ChatChannelType.ORDERITEM).map(i => i.channel),
              })
            })
          }));
        })
      );
    }

    ctx.setState(patch<MarketStateModel>({
      notifications: patch<MarketNotifications>({
        chatsUnread: patch<ChatNotifications>({
          listings: [],
          orders: [],
        })
      })
    }));
  }


  @Action(MarketUserActions.UpdateCurrentProfileDetails)
  updateCurrentProfileDetails(ctx: StateContext<MarketStateModel>, { profileData }: MarketUserActions.UpdateCurrentProfileDetails) {
    return iif(
      () => ctx.getState().profile && isBasicObjectType(profileData),

      defer(() => {
        const excludedKeys = ['id'];
        const filteredData = Object.keys(profileData)
          .filter(key => !excludedKeys.includes(key))
          .reduce((acc, key) => {
            return {...acc, [key]: profileData[key]};
          }, {});

        if (Object.keys(filteredData).length > 0) {
          ctx.setState(patch<MarketStateModel>({
            profile: patch<Profile>(filteredData)
          }));
        }
      }),

      defer(() => of(true))
    );
  }


  @Action(MarketUserActions.CreateIdentity)
  createIdentity(ctx: StateContext<MarketStateModel>, { identityName }: MarketUserActions.CreateIdentity) {

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
        const newId = this.buildIdentityItem(identityResp, state.defaultConfig.url, state.defaultConfig.imagePath);
        if ((newId.id > 0) && (ctx.getState().profile.id === profileId)) {
          ctx.patchState({ identities: [...ctx.getState().identities, newId]});
        }
      })
    );
  }


  @Action(MarketUserActions.AddIdentityMarket)
  AddMarket(ctx: StateContext<MarketStateModel>, { market }: MarketUserActions.AddIdentityMarket) {
    if (!isBasicObjectType(market)) {
      return;
    }

    const stateIds = ctx.getState().identities;
    const foundIdx = stateIds.findIndex(id => id.id === market.identityId);
    if (foundIdx > -1) {
      const updatedId = JSON.parse(JSON.stringify(stateIds[foundIdx]));
      updatedId.markets.push(market);

      ctx.setState(patch({
        identities: updateItem<Identity>(id => id.id === market.identityId, updatedId)
      }));
    }
  }


  @Action(MarketUserActions.RemoveIdentityMarket)
  removeMarket(ctx: StateContext<MarketStateModel>, { identityId, marketId }: MarketUserActions.RemoveIdentityMarket) {
    if (!(+identityId > 0) || !(+marketId > 0)) {
      return;
    }

    const stateIds = ctx.getState().identities;
    const foundIdx = stateIds.findIndex(id => id.id === identityId);
    if (foundIdx > -1) {
      const updatedId: Identity = JSON.parse(JSON.stringify(stateIds[foundIdx]));
      const mIdx = updatedId.markets.findIndex(m => m.id === marketId);
      if (mIdx >= 0) {
        updatedId.markets.splice(mIdx, 1);

        ctx.setState(patch({
          identities: updateItem<Identity>(id => id.id === identityId, updatedId)
        }));
      }
    }
  }


  @Action(MarketUserActions.SetSetting)
  changeMarketSetting(ctx: StateContext<MarketStateModel>, action: MarketUserActions.SetSetting) {
    const currentState = ctx.getState();
    const currentSettings = JSON.parse(JSON.stringify(currentState.settings));
    const origKey = action.key;
    const editedKey = origKey.startsWith('profile.') ? origKey.replace('profile.', '') : origKey;
    const newValue = action.value;
    let isSaved = false;

    if ( Object.keys(currentSettings).includes(editedKey) && (typeof currentSettings[editedKey] === typeof newValue) ) {
      if ((origKey !== editedKey) && currentState.profile !== null) {
        isSaved = this.saveLocalProfileSetting(currentState.profile.id, editedKey, newValue);
      } else {
        isSaved = true;
      }
    }

    if (isSaved) {
      ctx.setState(patch<MarketStateModel>({
        settings: patch<MarketSettings>({ [editedKey] : action.value })}
      ));
    }

    if (editedKey === 'marketsLastAdded') {
      ctx.setState(
        patch<MarketStateModel>({
          lastSmsgScanIssued: Date.now()
        })
      );
    }
  }


  @Action(MarketUserActions.CartItemAdded)
  cartAddItem(ctx: StateContext<MarketStateModel>, action: MarketUserActions.CartItemAdded) {
    if (action.identityId === ctx.getState().identity ) {
      ctx.setState(patch<MarketStateModel>({
        notifications: patch<MarketNotifications>({
          identityCartItemCount: ctx.getState().notifications.identityCartItemCount + 1
        })
      }));
    }
  }


  @Action(MarketUserActions.CartItemRemoved)
  cartRemoveItem(ctx: StateContext<MarketStateModel>, action: MarketUserActions.CartItemRemoved) {
    const identity = ctx.getState().identity;
    const currentIdentity = MarketState.currentIdentity(ctx.getState());
    if ((action.identityId === identity) && currentIdentity.carts[0] && (action.cartId === currentIdentity.carts[0].id) ) {
      ctx.setState(patch<MarketStateModel>({
        notifications: patch<MarketNotifications>({
          identityCartItemCount: Math.max(ctx.getState().notifications.identityCartItemCount - 1, 0)
        })
      }));
    }
  }


  @Action(MarketUserActions.CartCleared)
  cartRemoveAll(ctx: StateContext<MarketStateModel>, action: MarketUserActions.CartCleared) {
    const identityId = ctx.getState().identity;

    if (action.identityId === identityId) {
      ctx.setState(patch<MarketStateModel>({
        notifications: patch<MarketNotifications>({
          identityCartItemCount: 0
        })
      }));
    }
  }


  @Action(MarketUserActions.SetChatChannelsUnread)
  setChatChannelsUnread(ctx: StateContext<MarketStateModel>, action: MarketUserActions.SetChatChannelsUnread) {
    const ckey = this.getChatNotificationKey(action.channelType);
    if (!ckey) {
      return;
    }

    ctx.setState(patch<MarketStateModel>({
      notifications: patch<MarketNotifications>({
        chatsUnread: patch<ChatNotifications>({
          [ckey]: [...(new Set([...ctx.getState().notifications.chatsUnread[ckey], ...action.channels]))]
        })
      })
    }));
  }


  @Action(MarketUserActions.ChatChannelRead)
  setChannelAsRead(ctx: StateContext<MarketStateModel>, action: MarketUserActions.ChatChannelRead) {
    const ckey = this.getChatNotificationKey(action.channelType);
    if (!ckey) {
      return;
    }

    return this._marketService.call('chat', [
      'channelsetread',
      ctx.getState().identity,
      action.channel,
      action.channelType,
      Date.now(),
    ]).pipe(
      map(response => isBasicObjectType(response) && (response.success === true)),
      catchError(() => of(false)),
      tap(success => {
        if (success) {
          ctx.setState(patch<MarketStateModel>({
            notifications: patch<MarketNotifications>({
              chatsUnread: patch<ChatNotifications>({
                [ckey]: removeItem<string>(c => c === action.channel)
              })
            })
          }));
        }
      })
    );
  }


  @Action(MarketUserActions.AddOrdersPendingAction, {cancelUncompleted: true})
  addIdentityPendingOrders(
    ctx: StateContext<MarketStateModel>, { identityId, orderType, orderHashes }: MarketUserActions.AddOrdersPendingAction
  ) {

    if (!orderType || !orderHashes || !orderHashes.length) {
      return;
    }

    const itemKey = orderType === 'BUYER' ? 'buyOrdersPendingAction' : 'sellOrdersPendingAction';
    ctx.setState(patch<MarketStateModel>({
      notifications: patch<MarketNotifications>({
        // ensure uniqueness of order hashes in case duplicates are added (possible if adding from different sources)
        [itemKey]: nxgsIif(
          ctx.getState().identity === identityId,
          [...(new Set([...ctx.getState().notifications[itemKey], ...orderHashes]))]
        )
      })
    }));
  }


  @Action(MarketUserActions.OrderItemActioned)
  orderItemActioned(ctx: StateContext<MarketStateModel>, { orderType, orderHash }: MarketUserActions.OrderItemActioned) {
    if (orderType === 'BUYER') {
      return ctx.setState(patch<MarketStateModel>({
        notifications: patch<MarketNotifications>({
          buyOrdersPendingAction: removeItem<string>(hash => hash === orderHash)
        })
      }));
    } else if (orderType === 'SELLER') {
      return ctx.setState(patch<MarketStateModel>({
        notifications: patch<MarketNotifications>({
          sellOrdersPendingAction: removeItem<string>(hash => hash === orderHash)
        })
      }));
    }
  }


  @Action(MarketUserActions.OrderItemsCleared)
  orderItemsRemoveAll(ctx: StateContext<MarketStateModel>) {
    return ctx.setState(patch<MarketStateModel>({
      notifications: patch<MarketNotifications>({
        sellOrdersPendingAction: [],
        buyOrdersPendingAction: []
      })
    }));
  }


  private buildIdentityItem(src: RespIdentityListItem, marketUrl: string, defaultImage: string): Identity {
    const newItem: Identity = {
      id: 0,
      name: '',
      displayName: '',
      icon: '',
      address: '',
      carts: [],
      markets: [],
      path: ''
    };

    if (!isBasicObjectType(src)) {
      return newItem;
    }

    if (src.type === 'MARKET') {
      newItem.name = getValueOrDefault(src.wallet, 'string', newItem.name);
      newItem.displayName = getValueOrDefault(src.name, 'string', newItem.displayName);
      if (!newItem.displayName) {
        newItem.displayName = newItem.name;
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

      if (Array.isArray(src.Markets)) {
        src.Markets.forEach(market => {
          const idMarket = parseMarketResponseItem(market, marketUrl, defaultImage);

          if ((idMarket.id > 0) && (idMarket.identityId === newItem.id)) {
            newItem.markets.push(idMarket);
          }
        });
      }
    }

    return newItem;

  }


  private getChatNotificationKey(c: ChatChannelType): string {
    let ckey = '';
    switch (c) {
    case ChatChannelType.LISTINGITEM: ckey = 'listings'; break;
    case ChatChannelType.ORDERITEM: ckey = 'orders'; break;
    }
    return ckey;
  }


  private getSavedDefaultProfileID(): number {
    try {
      const allset = JSON.parse(localStorage.getItem('settings') || '{}') || {};
      const mset = Object.prototype.toString.call(allset.market) === '[object Object]' ? allset.market : {};
      const pset = Object.prototype.toString.call(mset.profileData) === '[object Object]' ? mset.profileData : {};
      if (+pset.defaultProfileID > 0) {
        return +pset.defaultProfileID;
      }
    } catch (e) { }
    return 0;
  }


  private getLocalProfileSettings(profileID: number | null): any {
    try {
      const allset = JSON.parse(localStorage.getItem('settings') || '{}') || {};
      const mset = Object.prototype.toString.call(allset.market) === '[object Object]' ? allset.market : {};
      const pset = Object.prototype.toString.call(mset.profileData) === '[object Object]' ? mset.profileData : {};
      if (typeof profileID === 'number' && Number.isSafeInteger(profileID)) {
        const idStr = `${profileID}`;
        return Object.prototype.toString.call(pset[idStr]) === '[object Object]' ? pset[idStr] : {};
      }
      return pset;
    } catch (e) { }

    return {};
  }


  private saveLocalProfileSetting(profileID: number, key: string, value: boolean | number | string): boolean {
    if (!(typeof profileID === 'number' && Number.isSafeInteger(profileID)) || typeof key !== 'string') {
      return false;
    }
    const proSets = this.getLocalProfileSettings(null);
    const pID = `${profileID}`;
    if (Object.prototype.toString.call(proSets[pID]) !== '[object Object]') {
      proSets[pID] = {};
    }
    proSets[pID][key] = value;

    try {
      const saved = JSON.parse(localStorage.getItem('settings') || '{}') || {};
      if (!('market' in saved) || Object.prototype.toString.call(saved.market) !== '[object Object]') {
        saved.market = {};
      }
      saved.market.profileData = proSets;
      localStorage.setItem('settings', JSON.stringify(saved));
      return true;
    } catch (_) {
      return false;
    }
  }

}
