import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Store } from '@ngxs/store';
import { Subject, merge } from 'rxjs';
import { takeUntil, tap, map, finalize } from 'rxjs/operators';
import { WalletInfoService } from 'app/main/services/wallet-info/wallet-info.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { WalletInfoState, WalletUTXOState } from 'app/main/store/main.state';
import { MainActions } from 'app/main/store/main.actions';
import { IWallet } from './market-base.models';
import { WalletUTXOStateModel, WalletInfoStateModel } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';
import { AlphaMainnetWarningComponent } from './alpha-mainnet-warning/alpha-mainnet-warning.component';


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
}


@Component({
  templateUrl: './market-base.component.html',
  styleUrls: ['./market-base.component.scss']
})
export class MarketBaseComponent implements OnInit, OnDestroy {

  otherIdentities: IWallet[] = [];

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview'},
    {text: 'Markets', path: 'management', icon: 'part-add-account'},
    {text: 'Listings', path: 'listings', icon: 'part-listings'},
    {text: 'Purchases', path: 'buy', icon: 'part-bag-buy'},
    {text: 'Sell', path: 'sell', icon: 'part-bag-sell'},
    {text: 'Proposals', path: 'proposals', icon: 'part-notification-speaker'},
    {text: 'Market Settings', path: 'settings', icon: 'part-tool'}
  ];

  private destroy$: Subject<void> = new Subject();
  private _currentWallet: IWallet = { name: '-', displayName: '-', initial: ''};
  private _walletBalance: string = '0';

  @ViewChild(MatExpansionPanel, {static: true}) private walletSelector: MatExpansionPanel;

  constructor(
    private _store: Store,
    private _router: Router,
    private _walletInfo: WalletInfoService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }


  ngOnInit() {
    const wallet$ = this._store.select(WalletInfoState.getValue('walletname')).pipe(
      tap((walletName: string) => this._currentWallet = this.processWallet(walletName)),
      takeUntil(this.destroy$)
    );

    const balance$ = this._store.select(WalletUTXOState).pipe(
      map((utxos: WalletUTXOStateModel) => {
        return this.extractUTXOSpendables(utxos);
      }),
      tap((amount) => this._walletBalance = (new PartoshiAmount(amount * Math.pow(10, 8))).particlsString()),
      takeUntil(this.destroy$)
    );


    merge(wallet$, balance$).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get currentIdentity(): IWallet {
    return this._currentWallet;
  }

  get currentBalance(): string {
    return this._walletBalance;
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
    this.cleanupWalletSelector();

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


  openedIdentitySelector() {
    this._walletInfo.getWalletList().pipe(
      map((walletList) => walletList.wallets.sort(
        (a, b) => {
          const x = a.name.toLocaleLowerCase();
          const y = b.name.toLocaleLowerCase();
          return x < y ? -1 : x > y ? 1 : 0;
        })
      )
    ).subscribe(
      (wallets) => {
        wallets.forEach((wallet) => {
          const wName = wallet.name.toLowerCase();
          const isTestnet = wName.startsWith('testnet/') || wName.startsWith('testnet\\') || (wName === 'testnet');
          if (!(isTestnet || (wName === this._currentWallet.name))) {
            this.otherIdentities.push(this.processWallet(wallet.name));
          }
        });
      },
      () => {
        this._snackbar.open(TextContent.IDENTITY_LOAD_ERROR, 'warn');
      }
    );
  }


  closedIdentitySelector() {
    this.cleanupWalletSelector();
  }


  private processWallet(name: string): IWallet {
    const n = typeof name === 'string' ? name : '???';
    return {
      name: n,
      displayName: n,
      initial: n[0]
    };
  }


  // @TODO: zaSmilingIdiot 2020-03-02 -> memoize this in the state to make balances easier to obtain from other components
  private extractUTXOSpendables(state: WalletUTXOStateModel): number {
    const tempBal = new PartoshiAmount(0);

    for (const utxo of state.anon) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount * Math.pow(10, 8)));
      }
    }
    return tempBal.particls();
  }


  private cleanupWalletSelector() {
    this.otherIdentities = [];
    if (this.walletSelector && this.walletSelector.opened) {
      this.walletSelector.close();
    }
  }
}
