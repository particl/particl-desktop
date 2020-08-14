import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { IpcService } from 'app/core/services/ipc.service';
import { Select } from '@ngxs/store';
import { WalletInfoState } from 'app/main/store/main.state';


@Component({
  templateUrl: './wallet-backup-modal.component.html',
  styleUrls: ['./wallet-backup-modal.component.scss']
})
export class WalletBackupModalComponent {

  @Output() onConfirmation: EventEmitter<string> = new EventEmitter<string>();

  @Select(WalletInfoState.getValue('walletname')) walletName: Observable<string>;

  private _error: string = '';
  private _filePath: string;


  constructor(
    private dialogRef: MatDialogRef<WalletBackupModalComponent>,
    private _ipc: IpcService
  ) { }

  get isActionDisabled(): boolean {
    return (this._error.length > 0) || (this._filePath === undefined);
  }

  get error(): string {
    return this._error;
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
        const newPath = Array.isArray(path) && (typeof path[0] === 'string') ? path[0] : undefined;
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
