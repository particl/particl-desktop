import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-send-confirmation-modal',
  templateUrl: './send-confirmation-modal.component.html',
  styleUrls: ['./send-confirmation-modal.component.scss']
})
export class SendConfirmationModalComponent {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  public dialogContent: string;

  constructor() {
  }

  confirm(): void {
    this.onConfirm.emit();
  }

}
