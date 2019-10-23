import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-wallet-backup-modal',
  templateUrl: './wallet-backup-modal.component.html',
  styleUrls: ['./wallet-backup-modal.component.scss']
})
export class WalletBackupModalComponent implements OnInit {

  private _actionDisabled: boolean = true;

  @Output() onConfirmation: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dialogRef: MatDialogRef<WalletBackupModalComponent>) { }

  ngOnInit(): void {
  }

  get isActionDisabled(): boolean {
    return this._actionDisabled;
  }

  doConfirmed(): void {
    this.onConfirmation.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
