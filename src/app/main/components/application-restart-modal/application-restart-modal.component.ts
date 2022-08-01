import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { CloseGuiService } from 'app/core/services/close-gui.service';


@Component({
  templateUrl: './application-restart-modal.component.html',
  styleUrls: ['./application-restart-modal.component.scss']
})
export class ApplicationRestartModalComponent {

  @Output() onConfirmation: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private dialogRef: MatDialogRef<ApplicationRestartModalComponent>,
    private _close: CloseGuiService
  ) { }

  doRestart(): void {
    this._close.quitElectron(true);
    this.onConfirmation.emit(true);
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
