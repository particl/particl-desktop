import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../../shared/listing-detail-modal/listing-detail-modal.component';

@Component({
  selector: 'app-buy-order-list-item',
  templateUrl: './buy-order-list-item.component.html',
  styleUrls: ['./buy-order-list-item.component.scss']
})
export class BuyOrderListItemComponent implements OnInit {

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

}
