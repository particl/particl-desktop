import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatExpansionPanel } from '@angular/material';
import { Subject, Observable, iif, defer, of, merge, combineLatest } from 'rxjs';
import { takeUntil, tap,  map, startWith, finalize, concatMap, mapTo, catchError } from 'rxjs/operators';

import { Store, Select } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { MarketStateActions, MarketUserActions } from '../store/market.actions';
import { Particl } from 'app/networks/networks.module';

import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { AlphaMainnetWarningComponent } from './alpha-mainnet-warning/alpha-mainnet-warning.component';
import { IdentityAddDetailsModalComponent } from './identity-add-modal/identity-add-details-modal.component';
import { ProfileBackupModalComponent } from './profile-backup-modal/profile-backup-modal.component';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { NotificationsService } from './notifications.service';
import { StartedStatus, Identity, MarketSettings } from '../store/market.models';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';


enum TextContent {
  IDENTITY_LOAD_ERROR = 'Failed to load markets',
  MARKET_LOADING = 'Activating the selected market',
  MARKET_ACTIVATE_SUCCESS = 'Successfully switched identity',
  MARKET_ACTIVATE_ERROR = 'Failed to activate and change to the selected identity',
  IDENTITY_ADD_SUCCESS = 'Successfully created the new Identity',
  IDENTITY_ADD_ERROR = 'Failed to create the new Identity',
}


interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
  alwaysEnabled: boolean;
  notificationValue?: any;
}


interface RenderedIdentity extends Identity {
  isActive: boolean;
}


@Component({
  templateUrl: './market-base.component.html',
  styleUrls: ['./market-base.component.scss'],
  providers: [NotificationsService]
})
export class MarketBaseComponent implements OnInit, OnDestroy {

  @Select(MarketState.settings) marketSettings: Observable<MarketSettings>;

  currentBalance: Observable<string>;
  identitiesList: RenderedIdentity[] = [];
  selectedIdentity: RenderedIdentity;

  isWarningVisible: boolean = true;
  showWalletLockedWarning = false;
  showProfileWarning: boolean = false;

  readonly mpVersion: string;

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview', alwaysEnabled: false, notificationValue: null},
    {text: 'Browse', path: 'listings', icon: 'part-shop', alwaysEnabled: false, notificationValue: null},
    {text: 'Cart', path: 'cart', icon: 'part-cart-2', alwaysEnabled: false, notificationValue: null},
    {text: 'Purchases', path: 'buy', icon: 'part-bag-buy', alwaysEnabled: false, notificationValue: null},
    {text: 'Sell', path: 'sell', icon: 'part-stock', alwaysEnabled: false, notificationValue: null},
    {text: 'Chat Messages', path: 'chat', icon: 'part-chat', alwaysEnabled: false, notificationValue: null},
    {text: 'Manage Markets', path: 'management', icon: 'part-bullet-list', alwaysEnabled: false, notificationValue: null},
    {text: 'Market Settings', icon: 'part-tool', path: 'settings', alwaysEnabled: true, notificationValue: null}
  ];

  private destroy$: Subject<void> = new Subject();
  private startedStatus: StartedStatus = StartedStatus.STOPPED;

  @ViewChild(MatExpansionPanel, {static: true}) private identitySelector: MatExpansionPanel;


  constructor(
    private _store: Store,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _notifications: NotificationsService,
    private _unlocker: WalletEncryptionService
  ) {
    this.mpVersion = this._store.selectSnapshot(ApplicationConfigState.moduleVersions('marketplace'));
    // _notifications is included in base so as to ensure its init'ed correctly when the market base is created, and then destroyed when
    //  the market is destroyed
    const notifyService = this._notifications;
  }


  ngOnInit() {

    const startedStatus$ = this._store.select(MarketState.startedStatus).pipe(
      tap((status) => this.startedStatus = status),
      takeUntil(this.destroy$)
    );

    const profile$ = this._store.select(MarketState.currentProfile).pipe(
      tap(profile => this.showProfileWarning = profile.hasMnemonicSaved),
      takeUntil(this.destroy$)
    );

    const showLockedWarning$ = this._store.select(Particl.State.Wallet.Info.isWalletLocked()).pipe(
      tap({
        next: isLocked => this.showWalletLockedWarning = isLocked,
      }),
      takeUntil(this.destroy$)
    );

    const indicators$ = merge(
      this._store.select(MarketState.notificationValue('identityCartItemCount')).pipe(
        tap((cartCountValue) => {
          const cartMenu = this.menu.find(m => m.path === 'cart');
          if (cartMenu) {
            cartMenu.notificationValue = +cartCountValue > 0 ? +cartCountValue : null;
          }
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.orderCountNotification('buy')).pipe(
        tap((value) => {
          const buyMenu = this.menu.find(m => m.path === 'buy');
          if (buyMenu) {
            buyMenu.notificationValue = +value > 0 ? +value : null;
          }
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.orderCountNotification('sell')).pipe(
        tap((value) => {
          const sellMenu = this.menu.find(m => m.path === 'sell');
          if (sellMenu) {
            sellMenu.notificationValue = +value > 0 ? +value : null;
          }
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.chatUnreadCountNotification('all')).pipe(
        tap(value => {
          const menu = this.menu.find(m => m.path === 'chat');
          if (menu) {
            menu.notificationValue = +value > 0 ? +value : null;
          }
        })
      ),
    );


    const identities$ = combineLatest([
      this._store.select(MarketState.currentIdentity).pipe(takeUntil(this.destroy$)),
      this._store.select(MarketState.currentProfileIdentities).pipe(takeUntil(this.destroy$))
    ]).pipe(
      tap(values => {
        const current = values[0];
        const identities = values[1];

        this.identitiesList = [];

        this.selectedIdentity = {
          ...current,
          isActive: true,
        };

        identities
          .map(id => ({
            ...id,
            isActive: id.id === current.id,
          }))
          .forEach(id => this.identitiesList.push(id));
      }),
    );

    merge(
      startedStatus$,
      indicators$,
      profile$,
      identities$,
      showLockedWarning$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();


    this.currentBalance = merge(
      this._store.select(Particl.State.Wallet.Balance.spendableAmountAnon()).pipe(takeUntil(this.destroy$)),
      this._store.select(MarketState.currentIdentity).pipe(takeUntil(this.destroy$)),
    ).pipe(
      startWith('0'),
      map(() => {
        if (+this._store.selectSnapshot(MarketState.currentIdentity).id > 0) {
          return this._store.selectSnapshot(Particl.State.Wallet.Balance.spendableAmountAnon());
        }
        return '0';
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._store.dispatch(new MarketStateActions.StopMarketService());
  }


  get isStarted(): boolean {
    return this.startedStatus === StartedStatus.STARTED;
  }


  trackByIdentityFn(idx: number, item: RenderedIdentity) {
    return item.id;
  }

  trackByMenuFn(idx: number, item: IMenuItem) {
    return idx;
  }


  openWarningMessage() {
    this._dialog.open(AlphaMainnetWarningComponent);
  }


  openBackupProfileModal() {
    this._dialog.open(ProfileBackupModalComponent);
  }


  openCreateIdentityModal() {
    this._dialog.open(IdentityAddDetailsModalComponent).afterClosed().pipe(
      concatMap((idName) => iif(
        () => (typeof idName === 'string') && (idName.length > 0),
        defer(() => {
          const profilePath: string = this._store.selectSnapshot(MarketState.currentProfile).walletPath;
          return this._unlocker.unlock({timeout: 20, wallet: profilePath}).pipe(
            concatMap(unlocked => iif(
              () => unlocked,

              defer(() => this._store.dispatch(new MarketUserActions.CreateIdentity(idName)).pipe(
                mapTo(true),
                catchError(() => of(false)),
                tap(success => {
                  if (success) {
                    this._snackbar.open(TextContent.IDENTITY_ADD_SUCCESS);
                    return;
                  }
                  this._snackbar.open(TextContent.IDENTITY_ADD_ERROR, 'warn');
                })
              ))

            ))
          );
        })
      ))
    ).subscribe();
  }


  identitySelected(identity: RenderedIdentity) {

    if (identity.isActive) {
      return;
    }

    this.identitySelector.close();

    this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.MARKET_LOADING}});

    this._store.dispatch(new MarketStateActions.SetCurrentIdentity(identity)).pipe(
      finalize(() => {
        this._dialog.closeAll();
      })
    ).subscribe(
      () => {
        const walletName: string = this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('walletname')) as string;

        if (walletName === identity.name) {
          this._snackbar.open(TextContent.MARKET_ACTIVATE_SUCCESS, 'success');
        } else {
          this._snackbar.open(TextContent.MARKET_ACTIVATE_ERROR, 'err');
        }
      },
      (_) => {
        this._snackbar.open(TextContent.MARKET_ACTIVATE_ERROR, 'err');
      }
    );
  }
}
