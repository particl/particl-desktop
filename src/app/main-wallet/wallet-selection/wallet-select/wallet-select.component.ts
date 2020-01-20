import { Component, AfterViewInit } from '@angular/core';
import { IWallet } from '../models/wallet-selection.models';
import { Store } from '@ngxs/store';
import { AppSettings } from 'app/core/store/app.actions';
import { Router } from '@angular/router';
import { MultiwalletService } from '../services/multiwallets/multiwallets.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';


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
    private _multi: MultiwalletService,
    private _snackbar: SnackbarService
  ) { }


  ngAfterViewInit() {
    this.fetchWallets();
  }

  get wallets(): IWallet[] {
    return this._wallets;
  }

  navigateToWallet(wallet: IWallet) {
    this._multi.loadWallet(wallet).subscribe(
      (success: boolean) => {
        this._store.dispatch(new AppSettings.SetActiveWallet(wallet.name)).subscribe(
          () => {
            this._router.navigate(['/main/wallet/active/overview']);
          }
        );
      },
      () => {
        this._snackbar.open('Failed to the selected wallet', 'error');
      }
    )
  }


  refreshWallets() {
    if (!this.hasError) {
      return;
    }
    this.hasError = false;
    this.fetchWallets();
  }


  private fetchWallets() {
    this._multi.fetchWalletInfo().subscribe(
      (wallets) => {
        this._wallets = wallets;
      },
      () => {
        this.hasError = true;
      }
    )
  }
}
