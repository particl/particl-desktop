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
import { IWallet } from './wallet-base.models';
import { WalletUTXOStateModel, WalletInfoStateModel } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';
import { environment } from 'environments/environment';


enum TextContent {
  DEFAULT_WALLETNAME = 'Default Wallet',
  UNKNOWN_WALLET = 'New wallet…',
  WALLETS_LOAD_ERROR = 'Failed to load wallets',
  WALLET_LOADING = 'Activating the selected wallet',
  WALLET_ACTIVATE_SUCCESS = 'Wallet loaded successfully',
  WALLET_ACTIVATE_ERROR = 'Failed to activate and load the selected wallet'
}


@Component({
  templateUrl: './wallet-base.component.html',
  styleUrls: ['./wallet-base.component.scss']
})
export class WalletBaseComponent implements OnInit, OnDestroy {

  otherWallets: IWallet[] = [];

  readonly walletVersion: string = environment.walletVersion || '';


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
      tap((amount) => this._walletBalance = (new PartoshiAmount(amount)).particlsString()),
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


  get currentWallet(): IWallet {
    return this._currentWallet;
  }

  get currentBalance(): string {
    return this._walletBalance;
  }


  trackByWalletsFn(idx: number, item: IWallet) {
    return item.name;
  }


  navigateToWallet(wallet: IWallet) {
    this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.WALLET_LOADING}});
    this.cleanupWalletSelector();

    this._store.dispatch(new MainActions.ChangeWallet(wallet.name)).pipe(
      finalize(() => this._dialog.closeAll())
    ).subscribe(
      () => {
        const walletData: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);

        // Hacky solution to ensure that a change in the wallet selection redirects to the create/restore wallet component
        //  -> Yes, the canActivate, etc route guards exist, but do not work when switching wallets to a component
        //     that is currently rendered.
        let targetRoute = '/main/wallet/active/overview';

        if ((walletData.walletname === null) || !walletData.hdseedid) {
          targetRoute = '/main/wallet/create';
        }

        this._router.navigate([targetRoute]);

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


  navigateToCreateWallet() {
    this.cleanupWalletSelector();

    this._store.dispatch(new MainActions.ResetWallet()).subscribe(
      () => {
        this._router.navigate(['/main/wallet/create']);
      }
    );
  }


  openedWalletSelector() {
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
          if (!(
            // prevent testnet wallets on mainnet
            wName.startsWith('testnet/') ||
            wName.startsWith('testnet\\') ||
            (wName === 'testnet') ||
            // avoid including the current active wallet
            (wallet.name === this._currentWallet.name) ||
            // avoid market profiles (that are technically wallets but shouldn't be used as them for now)
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


  private processWallet(name: string): IWallet {
    const usedName = name === null ?  TextContent.UNKNOWN_WALLET : name;
    let dispName = usedName === '' ? TextContent.DEFAULT_WALLETNAME : usedName;
    dispName = this.formatWalletDisplayName(dispName, '/');
    dispName = this.formatWalletDisplayName(dispName, '\\');
    const initial = dispName[0];

    return {
      name,
      initial,
      displayName: dispName,
    };
  }


  // @TODO: zaSmilingIdiot 2020-03-02 -> memoize this in the state to make balances easier to obtain from other components
  private extractUTXOSpendables(state: WalletUTXOStateModel): number {
    const tempBal = new PartoshiAmount(0);

    const balTypes = Object.keys(state);
    for (const key of balTypes) {
      const utxos = state[key];

      for (let ii = 0; ii < utxos.length; ++ii) {
        const utxo = utxos[ii];
        let spendable = true;
        if ('spendable' in utxo) {
          spendable = utxo.spendable;
        }
        if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
          tempBal.add(new PartoshiAmount(utxo.amount));
        }
      }
    }
    return tempBal.particls();
  }


  private cleanupWalletSelector() {
    this.otherWallets = [];
    if (this.walletSelector && this.walletSelector.opened) {
      this.walletSelector.close();
    }
  }


  private formatWalletDisplayName(originalName: string, char: string): string {
    let dispName = originalName;
    if (originalName.includes(char)) {
      let dispNameParts = originalName.split(char);
      if (dispNameParts.length > 2) {
        dispNameParts = [dispNameParts[dispNameParts.length - 2 ], dispNameParts[dispNameParts.length - 1 ]];
      }
      dispName = dispNameParts.join(char);
    }
    return dispName;
  }
}