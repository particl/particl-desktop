import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { SORTED_BID_REJECT_MESSAGES } from './bid-reject-messages';

@Component({
  selector: 'app-bid-reject',
  templateUrl: './bid-reject.component.html',
  styleUrls: ['./bid-reject.component.scss']
})
export class BidRejectComponent {
  public processing: boolean = false;
  public messages: any[] = SORTED_BID_REJECT_MESSAGES;
  public selectedMessage: any | null;

  @Output() isConfirmed: EventEmitter<string> = new EventEmitter();
  constructor(public _dialogRef: MatDialogRef<BidRejectComponent>) { }

  confirm(): void {
    this.processing = false;
    this._dialogRef.close();
    this.isConfirmed.emit(this.selectedMessage);
  }
}
