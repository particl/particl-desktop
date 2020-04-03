import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatExpansionPanel } from '@angular/material';
import { Store, Select } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { WalletInfoState, WalletUTXOState } from 'app/main/store/main.state';
import { MarketActions } from '../store/market.actions';
import { Subject, Observable, concat } from 'rxjs';
import { takeUntil, tap,  map, startWith, finalize } from 'rxjs/operators';

import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { AlphaMainnetWarningComponent } from './alpha-mainnet-warning/alpha-mainnet-warning.component';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { StartedStatus, Identity } from '../store/market.models';
import { WalletInfoStateModel, WalletUTXOStateModel } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';


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

  @Select(MarketState.filteredIdentitiesList) otherIdentities: Observable<Identity[]>;
  @Select(MarketState.currentIdentity) selectedIdentity: Observable<Identity>;

  currentBalance: Observable<string>;

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview', alwaysEnabled: false},
    {text: 'Browse Markets', path: 'listings', icon: 'part-shop', alwaysEnabled: false},
    {text: 'Purchases', path: 'buy', icon: 'part-cart-2', alwaysEnabled: false},
    {text: 'Sell', path: 'sell', icon: 'part-stock', alwaysEnabled: false},
    //{text: 'Proposals', path: 'proposals', icon: 'part-notification-speaker', alwaysEnabled: false},
    {text: 'Manage Markets', path: 'management', icon: 'part-bullet-list', alwaysEnabled: false},
    {text: 'Market Settings', icon: 'part-tool', path: 'settings', alwaysEnabled: true}
  ];

  private destroy$: Subject<void> = new Subject();
  private startedStatus: StartedStatus = StartedStatus.STOPPED;

  @ViewChild(MatExpansionPanel, {static: true}) private identitySelector: MatExpansionPanel;


  constructor(
    private _store: Store,
    private _router: Router,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }


  ngOnInit() {

    this._router.navigate(['/main/market/loading']);

    this._store.select(MarketState.startedStatus).pipe(
      tap((status) => {
        if (this.startedStatus === status) {
          // ignore initial market state update, as well as routing based on same state update
          return;
        }

        this.startedStatus = status;

        if (status === StartedStatus.STARTED) {
          // Check if navigation was made to one of the 'alwaysEnabled' paths... prevent further navigation if it was.
          const currentPathParts = this._router.url.split('/');
          const lastPath = currentPathParts[currentPathParts.length - 1];
          const didNavigate = this.menu.findIndex(m => m.alwaysEnabled && m.path === lastPath);
          if (didNavigate === -1) {
            this._router.navigate(['/main/market/overview']);
          }
        } else if (status !== StartedStatus.PENDING) {
          this._router.navigate(['/main/market/settings']);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();


    this.currentBalance = concat(
      this._store.select(WalletUTXOState),
      this._store.select(MarketState.currentIdentity)
    ).pipe(
      map(() => {
        const utxos: WalletUTXOStateModel = this._store.selectSnapshot(WalletUTXOState);
        return this.extractSpendableBalance(utxos);
      }),
      startWith('0')
    );

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


  trackByIdentityFn(idx: number, item: Identity) {
    return item.id;
  }

  trackByMenuFn(idx: number, item: IMenuItem) {
    return idx;
  }


  openWarningMessage() {
    this._dialog.open(AlphaMainnetWarningComponent);
  }


  identitySelected(identity: Identity) {

    this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.MARKET_LOADING}});
    this._store.dispatch(new MarketActions.SetCurrentIdentity(identity)).pipe(
      finalize(() => this._dialog.closeAll())
    ).subscribe(
      () => {
        const walletData: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);
        if (this.identitySelector && this.identitySelector.opened) {
          this.identitySelector.close();
        }

        this._router.navigate(['/main/market']);

        if (walletData.walletname === identity.name) {
          this._snackbar.open(TextContent.MARKET_ACTIVATE_SUCCESS, 'success');
        } else {
          this._snackbar.open(TextContent.MARKET_ACTIVATE_ERROR, 'err');
        }
      },
      (err) => {
        this._snackbar.open(TextContent.MARKET_ACTIVATE_ERROR, 'err');
      }
    );
  }


  private extractSpendableBalance(allUtxos: WalletUTXOStateModel): string {
    const tempBal = new PartoshiAmount(0);
    const utxos = allUtxos.anon || [];

    for (const utxo of utxos) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount * Math.pow(10, 8)));
      }
    }

    return tempBal.particlsString();
  }
}
