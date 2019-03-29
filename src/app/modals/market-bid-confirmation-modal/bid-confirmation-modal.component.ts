import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Bid } from 'app/core/market/api/bid/bid.model';

@Component({
  selector: 'app-bid-confirmation-modal',
  templateUrl: './bid-confirmation-modal.component.html',
  styleUrls: ['./bid-confirmation-modal.component.scss']
})
export class BidConfirmationModalComponent implements OnInit {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  public dialogContent: string;
  public bidItem: Bid;
  public country: string = '';

  constructor(private dialogRef: MatDialogRef<BidConfirmationModalComponent>) { }

  ngOnInit() {
    this.country = this.bidItem ? this.bidItem.ShippingAddress.country : '';
  }

  confirm(): void {
    this.onConfirm.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
