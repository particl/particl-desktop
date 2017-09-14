import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-send-confirmation-modal',
  templateUrl: './send-confirmation-modal.component.html',
  styleUrls: ['./send-confirmation-modal.component.scss']
})
export class SendConfirmationModalComponent {

  @Output() onConfirm = new EventEmitter();

  public dialogContent: string;

  constructor() {
  }

  confirm(): void {
    this.onConfirm.emit();
  }

}
