import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material';
import { SettingsStateService } from '../settings-state.service';
import { IpcService } from 'app/core/core.module';


@Component({
  selector: 'app-wallet-backup-modal',
  templateUrl: './wallet-backup-modal.component.html',
  styleUrls: ['./wallet-backup-modal.component.scss']
})
export class WalletBackupModalComponent implements OnInit {

  private _error: string = '';
  private _filePath: string;
  private _walletName: string;


  @Output() onConfirmation: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private dialogRef: MatDialogRef<WalletBackupModalComponent>,
    private _settings: SettingsStateService,
    private _ipc: IpcService
  ) { }

  ngOnInit(): void {
    this._settings.currentWallet().pipe(take(1)).subscribe( (wallet) => {
      this._walletName = wallet.displayname;
    })
  }

  get isActionDisabled(): boolean {
    return (this._error.length > 0) || (this._filePath === undefined);
  }

  get error(): string {
    return this._error;
  }

  get walletName(): string {
    return this._walletName ? this._walletName : '';
  }

  get filePath(): string {
    return this._filePath || '<not selected>';
  }

  selectBackupPath() {
    const options = {
      modalType: 'OpenDialog',
      modalOptions: {
        title: 'Wallet Backup Location',
        message: 'Select a folder to backup the wallet to',
        properties: ['openDirectory']
      }
    };
    this._ipc.runCommand('open-system-dialog', null, options).toPromise().then(
      (path) => {
        const newPath = Object.prototype.toString.call(path) === '[object Array]' && (typeof path[0] === 'string') ? path[0] : undefined;
        if (newPath) {
          this._filePath = newPath;
        }
        this._error = '';
      }
    ).catch((err) => {
      this._error = 'Something went wrong attempting to get the folder path';
    });
  }

  doConfirmed(): void {
    if (this._filePath && this._filePath.length) {
      this.onConfirmation.emit(this._filePath);
    }
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
