import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { IpcService } from 'app/core/services/ipc.service';


@Component({
  templateUrl: './application-restart-modal.component.html',
  styleUrls: ['./application-restart-modal.component.scss']
})
export class ApplicationRestartModalComponent {

  @Output() onConfirmation: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private dialogRef: MatDialogRef<ApplicationRestartModalComponent>,
    private _ipc: IpcService
  ) { }

  doRestart(): void {
    this._ipc.runCommand('close-gui', null, true);
    this.onConfirmation.emit(true);
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
