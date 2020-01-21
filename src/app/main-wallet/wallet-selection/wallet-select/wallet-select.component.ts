import { Component, AfterViewInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { WalletSelectService } from './wallet-select.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';

import { AppSettings } from 'app/core/store/app.actions';
import { AppSettingsState } from 'app/core/store/appsettings.state';

import { IWallet } from './wallet-select.models';


enum TextContent {
  WALLET_LOAD_SUCCESS = 'Successfully Loaded Wallet',
  WALLET_LOAD_WARNING = 'Loaded wallet, but with warnings. Please manually navigate',
  WALLET_LOAD_ERROR = 'Failed to load the selected wallet'
};

@Component({
  templateUrl: './wallet-select.component.html',
  styleUrls: ['./wallet-select.component.scss']
})
export class WalletSelectComponent implements AfterViewInit {

  hasError: boolean = false;

  private _wallets: IWallet[] = [];

  constructor(
    private _store: Store,
    private _router: Router,
    private _selectService: WalletSelectService,
    private _snackbar: SnackbarService
  ) { }


  ngAfterViewInit() {
    this.fetchWallets();
  }

  get wallets(): IWallet[] {
    return this._wallets;
  }


  navigateToWallet(wallet: IWallet) {
    this._store.dispatch(new AppSettings.SetActiveWallet(wallet.name)).subscribe(
      () => {
        const activatedWallet = this._store.selectSnapshot(AppSettingsState.activeWallet);
        if (activatedWallet === wallet.name) {
          this._snackbar.open(TextContent.WALLET_LOAD_SUCCESS, 'success');
          this._router.navigate(['/main/wallet/active/overview']);
        } else {
          this._snackbar.open(TextContent.WALLET_LOAD_ERROR, 'error');
        }
      },
      () => {
        this._snackbar.open(TextContent.WALLET_LOAD_ERROR, 'error');
      }
    );
  }


  refreshWallets() {
    if (!this.hasError) {
      return;
    }
    this.hasError = false;
    this.fetchWallets();
  }


  private fetchWallets() {
    this._selectService.fetchWalletInfo().subscribe(
      (wallets) => {
        this._wallets = wallets;
      },
      () => {
        this.hasError = true;
      }
    )
  }
}
