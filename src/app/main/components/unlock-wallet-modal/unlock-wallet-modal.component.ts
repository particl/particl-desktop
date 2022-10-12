import { Component, Inject, HostListener, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UnlockModalConfig } from '../../services/wallet-encryption/wallet-encryption.model';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { ParticlWalletService } from 'app/networks/networks.module';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { finalize } from 'rxjs/operators';


enum TextContent {
  UNLOCK_ERROR_PASSWORD = 'Unlock failed - incorrect password',
  UNLOCK_ERROR_FAILURE = 'An unexpected error occurred!'
}


@Component({
  templateUrl: './unlock-wallet-modal.component.html',
  styleUrls: ['./unlock-wallet-modal.component.scss']
})
export class UnlockwalletModalComponent implements AfterViewInit {

  readonly timeoutIsEditable?: boolean;
  readonly showStakingUnlock?: boolean;

  readonly otherWalletName: string;

  timeout: number;
  showPass: boolean = false;
  password: string = '';
  unlockForStaking: boolean = false;
  isProcessing: boolean = false;
  disableAnimation: boolean = true;


  constructor(
    public _dialogRef: MatDialogRef<UnlockwalletModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: UnlockModalConfig,
    private _walletService: ParticlWalletService,
    private _snackbar: SnackbarService
  ) {
    this.timeout = (typeof this.data.timeout === 'number') && (Number.isInteger(this.data.timeout)) && (this.data.timeout >= 0) ?
      this.data.timeout : 300;

    this.showStakingUnlock = typeof this.data.showStakingUnlock === 'boolean' ? this.data.showStakingUnlock : false;
    this.timeoutIsEditable = typeof this.data.timeoutIsEditable === 'boolean' ? this.data.timeoutIsEditable : true;

    this.otherWalletName = this.data.wallet ? this.data.wallet : null;

  }


  ngAfterViewInit(): void {
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    // Implemented to avoid FOUC and mat-expansion-panel temporarily being opened and then suddenly closed, on render..
    //    see Angular Material issue: https://github.com/angular/components/issues/13870
    setTimeout(() => this.disableAnimation = false);
  }


  unlock() {
    if (!this.password) {
      return;
    }

    if (this.timeout <= 0) {
      return;
    }

    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    this._walletService.walletPassphrase(this.otherWalletName, this.password, this.timeout, this.unlockForStaking).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe(
      () => {
        this._dialogRef.close(this.timeout);
      },
      (err: RPCResponses.Error) => {
        if ((typeof err === 'object') && err.code === -14) {
          this._snackbar.open(TextContent.UNLOCK_ERROR_PASSWORD, 'info');
        } else {
          this._snackbar.open(TextContent.UNLOCK_ERROR_FAILURE, 'err');
        }
      }
    );
  }


  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      this.unlock();
    }
  }

}
