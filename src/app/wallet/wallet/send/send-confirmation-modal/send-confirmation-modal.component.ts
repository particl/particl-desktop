import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-send-confirmation-modal',
  templateUrl: './send-confirmation-modal.component.html',
  styleUrls: ['./send-confirmation-modal.component.scss']
})
export class SendConfirmationModalComponent {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  public dialogContent: string;

  constructor(private diloagRef: MatDialogRef<SendConfirmationModalComponent>) {
  }

  confirm(): void {
    this.onConfirm.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.diloagRef.close();
  }

}
