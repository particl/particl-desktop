import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-bid-cancel',
  templateUrl: './bid-cancel.component.html',
  styleUrls: ['./bid-cancel.component.scss']
})
export class BidCancelComponent {
  public processing: boolean = false;

  @Output() isConfirmed: EventEmitter<string> = new EventEmitter();
  constructor(public _dialogRef: MatDialogRef<BidCancelComponent>) { }

  confirm(): void {
    this.processing = false;
    this._dialogRef.close();
    this.isConfirmed.emit();
  }
}
