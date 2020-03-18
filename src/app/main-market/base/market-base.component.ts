import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { WalletInfoState } from 'app/main/store/main.state';
import { MainActions } from 'app/main/store/main.actions';
import { Subject } from 'rxjs';
import { takeUntil, tap, finalize } from 'rxjs/operators';

import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { AlphaMainnetWarningComponent } from './alpha-mainnet-warning/alpha-mainnet-warning.component';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { IWallet } from './market-base.models';
import { StartedStatus } from '../store/market.models';
import { WalletInfoStateModel } from 'app/main/store/main.models';
import { MarketActions } from '../store/market.actions';


enum TextContent {
  IDENTITY_LOAD_ERROR = 'Failed to load markets',
  MARKET_LOADING = 'Activating the selected market',
  MARKET_ACTIVATE_SUCCESS = 'Successfully loaded market',
  MARKET_ACTIVATE_ERROR = 'Failed to activate and load the selected market'
}


interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
  alwaysEnabled: boolean;
}


@Component({
  templateUrl: './market-base.component.html',
  styleUrls: ['./market-base.component.scss']
})
export class MarketBaseComponent implements OnInit, OnDestroy {

  otherIdentities: IWallet[] = [];

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview', alwaysEnabled: false},
    {text: 'Markets', path: 'management', icon: 'part-add-account', alwaysEnabled: false},
    {text: 'Listings', path: 'listings', icon: 'part-listings', alwaysEnabled: false},
    {text: 'Purchases', path: 'buy', icon: 'part-bag-buy', alwaysEnabled: false},
    {text: 'Sell', path: 'sell', icon: 'part-bag-sell', alwaysEnabled: false},
    {text: 'Proposals', path: 'proposals', icon: 'part-notification-speaker', alwaysEnabled: false},
    {text: 'Market Settings', icon: 'part-tool', path: 'settings', alwaysEnabled: true}
  ];

  private destroy$: Subject<void> = new Subject();
  private _currentWallet: IWallet = { name: '-', displayName: '-', initial: '', balance: '0'};
  private startedStatus: StartedStatus = StartedStatus.STOPPED;


  constructor(
    private _store: Store,
    private _router: Router,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }


  ngOnInit() {

    this._store.select(MarketState.startedStatus).pipe(
      tap((status) => {
        if (this.startedStatus === status) {
          // ignore initial market state update, as well as routing based on same state update
          return;
        }

        this.startedStatus = status;

        if (status === StartedStatus.PENDING) {
          this._router.navigate(['/main/market/loading']);
        } else if (status === StartedStatus.STARTED) {
          this._router.navigate(['/main/market/overview']);
        } else {
          this._router.navigate(['/main/market/settings']);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this._store.dispatch(new MarketActions.StartMarketService());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._store.dispatch(new MarketActions.StopMarketService());
  }


  get isStarted(): boolean {
    return this.startedStatus === StartedStatus.STARTED;
  }


  get currentIdentity(): IWallet {
    return this._currentWallet;
  }


  trackByIdentityFn(idx: number, item: IWallet) {
    return item.name;
  }

  trackByMenuFn(idx: number, item: IMenuItem) {
    return idx;
  }


  openWarningMessage() {
    this._dialog.open(AlphaMainnetWarningComponent);
  }


  identitySelected(identity: IWallet) {

    this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.MARKET_LOADING}});

    this._store.dispatch(new MainActions.ChangeWallet(identity.name)).pipe(
      finalize(() => this._dialog.closeAll())
    ).subscribe(
      () => {
        const walletData: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);
        this._router.navigate(['/main/market']);

        if (walletData.walletname === identity.name) {
          this._snackbar.open(TextContent.MARKET_ACTIVATE_SUCCESS, 'success');
        } else {
          this._snackbar.open(TextContent.MARKET_ACTIVATE_ERROR, 'err');
        }
      },
      () => {
        this._snackbar.open(TextContent.MARKET_ACTIVATE_ERROR, 'err');
      }
    );
  }
}
