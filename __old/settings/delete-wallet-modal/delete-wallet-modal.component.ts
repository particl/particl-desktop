import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { take } from 'rxjs/operators';
import { SettingsStateService } from '../settings-state.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-wallet-modal.component.html',
  styleUrls: ['./delete-wallet-modal.component.scss']
})
export class DeleteWalletModalComponent implements OnInit {

  public walletName: string = '';
  public wallets: any[] = [];
  public returnWalletName: string;
  private invalidWallet: boolean = false;

  @Output() onConfirmation: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private dialogRef: MatDialogRef<DeleteWalletModalComponent>,
    private _settings: SettingsStateService,
    private _multi: MultiwalletService) { }

  ngOnInit(): void {
    this._settings.currentWallet().pipe(take(1)).subscribe(
      (wallet) => {
        this.walletName = wallet.displayname
        if (wallet.name === '' || wallet.isMarketEnabled) {
          this.invalidWallet = true;
        }
      },
      () => {},
      () => {
        this._multi.list.subscribe(
          (wallets) => {
            this.wallets = wallets.map(w => {
              return {name: w.displayname, value: w.name}
            }).filter(w => w.name !== this.walletName);
          }
        )
      }
    );
  }

  get isInvalidRequest(): boolean {
    return this.invalidWallet;
  }

  doConfirmation(): void {
    if (typeof this.returnWalletName === 'string') {
      this.onConfirmation.emit(this.returnWalletName);
    }
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
