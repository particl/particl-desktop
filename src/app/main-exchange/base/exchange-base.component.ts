import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil, tap, map, finalize } from 'rxjs/operators';

import { WalletInfoState } from 'app/main/store/main.state';
import { MainActions } from 'app/main/store/main.actions';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletInfoService } from 'app/main/services/wallet-info/wallet-info.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';

import { WalletInfoStateModel } from 'app/main/store/main.models';


enum TextContent {
  DEFAULT_WALLETNAME = 'Default Wallet',
  WALLETS_LOAD_ERROR = 'Failed to load wallets',
  WALLET_LOADING = 'Activating the selected wallet',
  WALLET_ACTIVATE_SUCCESS = 'Wallet loaded successfully',
  WALLET_ACTIVATE_ERROR = 'Failed to activate and load the selected wallet'
}


interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
}


interface IWallet {
  name: string;
  displayName: string;
  initial: string;
}


@Component({
  selector: 'app-exchange-base',
  templateUrl: './exchange-base.component.html',
  styleUrls: ['./exchange-base.component.scss']
})
export class ExchangeBaseComponent implements OnInit, OnDestroy {

  otherWallets: IWallet[] = [];

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview'},
    {text: 'New Exchange', path: 'new', icon: 'part-circle-plus'},
    {text: 'Exchange Bots', path: 'bots', icon: 'part-tool'}
  ];


  private destroy$: Subject<void> = new Subject();
  private _currentWallet: IWallet = { name: '-', displayName: '-', initial: ''};

  @ViewChild(MatExpansionPanel, {static: true}) private walletSelector: MatExpansionPanel;


  constructor(
    private _store: Store,
    private _walletService: WalletInfoService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }


  ngOnInit() {
    this._store.select(WalletInfoState.getValue('walletname')).pipe(
      tap((walletName: string) => this._currentWallet = this.processWallet(walletName)),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get currentWallet(): IWallet {
    return this._currentWallet;
  }


  openedWalletSelector() {
    this._walletService.getWalletList().pipe(
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
          if (!(
            // prevent testnet wallets on mainnet
            wName.startsWith('testnet/') ||
            wName.startsWith('testnet\\') ||
            (wName === 'testnet') ||
            // avoid including the current active wallet
            (wallet.name === this._currentWallet.name) ||
            // avoid market profiles (that are technically wallets but shouldn't be used as them)
            (wName.startsWith('profiles') && ((wName.split('/').length === 2) || (wName.split('\\').length === 2)))
          )) {
            this.otherWallets.push(this.processWallet(wallet.name));
          }
        });
      },
      () => {
        this._snackbar.open(TextContent.WALLETS_LOAD_ERROR, 'warn');
      }
    );
  }


  closedWalletSelector() {
    this.cleanupWalletSelector();
  }


  navigateToWallet(wallet: IWallet) {
    const dialog = this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.WALLET_LOADING}});
    this.cleanupWalletSelector();

    this._store.dispatch(new MainActions.ChangeWallet(wallet.name)).pipe(
      finalize(() => this._dialog.getDialogById(dialog.id).close())
    ).subscribe(
      () => {
        const walletData: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);

        if (walletData.walletname === wallet.name) {
          this._snackbar.open(TextContent.WALLET_ACTIVATE_SUCCESS, 'success');
        } else {
          this._snackbar.open(TextContent.WALLET_ACTIVATE_ERROR, 'err');
        }
      },
      () => {
        this._snackbar.open(TextContent.WALLET_ACTIVATE_ERROR, 'err');
      }
    );
  }


  private processWallet(name: string): IWallet {
    if (name === null) {
      return {name: '-', initial: '', displayName: '-'};
    }
    let dispName = name === '' ? TextContent.DEFAULT_WALLETNAME : name;
    let initial = dispName[0];
    if (dispName.includes('/')) {
      let dispNameParts = dispName.split('/');
      if (dispNameParts.length > 2) {
        dispNameParts = [dispNameParts[dispNameParts.length - 2 ], dispNameParts[dispNameParts.length - 1 ]];
        initial = (dispNameParts[dispNameParts.length - 1])[0];
      }
      dispName = dispNameParts.join('/');
    }
    return {
      name,
      initial,
      displayName: dispName,
    };
  }


  private cleanupWalletSelector() {
    this.otherWallets = [];
    if (this.walletSelector && this.walletSelector.opened) {
      this.walletSelector.close();
    }
  }

}
