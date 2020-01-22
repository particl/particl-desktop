import { Component, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { WalletSelectService } from './wallet-select.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';

import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';

import { IWallet } from './wallet-select.models';
import { MainActions } from 'app/main/store/main.actions';
import { WalletInfoState } from 'app/main/store/main.state';
import { finalize } from 'rxjs/operators';


enum TextContent {
  WALLET_LOADING = 'Activating the selected wallet',
  WALLET_LOAD_SUCCESS = 'Successfully Loaded Wallet',
  WALLET_LOAD_ERROR = 'Failed to activate and load the selected wallet'
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
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }


  ngAfterViewInit() {
    this.fetchWallets();
  }

  get wallets(): IWallet[] {
    return this._wallets;
  }


  navigateToWallet(wallet: IWallet) {
    this.openProcessingModal();
    this._store.dispatch(new MainActions.ChangeWallet(wallet.name)).pipe(
      finalize(() => this._dialog.closeAll())
    ).subscribe(
      () => {
        const activatedWallet = this._store.selectSnapshot(WalletInfoState.getValue('walletname'));
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


  private openProcessingModal() {
    this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: TextContent.WALLET_LOADING
      }
    });
  }
}
