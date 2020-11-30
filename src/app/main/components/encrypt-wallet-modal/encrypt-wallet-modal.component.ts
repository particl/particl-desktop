import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { WalletInfoService } from '../../services/wallet-info/wallet-info.service';


enum TextContent {
  PASSWORD_ERROR = 'The passwords do not match!',
  ENCRYPT_FAILED = 'Wallet failed to encrypt properly!',
  ENCRYPT_SUCCESS = 'Wallet successfully encrypted: Please create a new wallet backup'
}


@Component({
  templateUrl: './encrypt-wallet-modal.component.html',
  styleUrls: ['./encrypt-wallet-modal.component.scss']
})
export class EncryptwalletModalComponent {


  showPass: boolean = false;
  isProcessing: boolean = false;
  password: string = '';
  confirmation: string = '';

  private isConfirming: boolean = false;


  constructor(
    public _dialogRef: MatDialogRef<EncryptwalletModalComponent>,
    private _snackbar: SnackbarService,
    private _walletService: WalletInfoService
  ) { }


  get hasPassword(): boolean {
    return this.isConfirming;
  }


  encrypt() {
    if (this.password.length <= 0) {
      return;
    }
    if (this.isProcessing || this.isConfirming) {
      return;
    }
    this.isConfirming = true;
    this.showPass = false;
  }


  confirmPass() {
    if ((this.password.length <= 0) || (this.confirmation.length <= 0)) {
      return;
    }
    if (this.isProcessing || !this.isConfirming) {
      return;
    }
    this.isProcessing = true;

    if (this.password !== this.confirmation) {
      this._snackbar.open(TextContent.PASSWORD_ERROR, 'err');
      this.isProcessing = false;
      return;
    }

    this._dialogRef.disableClose = true;
    this._walletService.encryptWallet(this.confirmation).pipe(
      finalize(() => {
        this.isProcessing = false;
        this._dialogRef.disableClose = false;
      })
    ).subscribe(
      () => {
        this._snackbar.open(TextContent.ENCRYPT_SUCCESS, 'info');
        this._dialogRef.close(true);
      },
      () => {
        this._snackbar.open(TextContent.ENCRYPT_FAILED, 'err');
      }
    );
  }


  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      this.isConfirming ? this.confirmPass() : this.encrypt();
    }
  }
}
