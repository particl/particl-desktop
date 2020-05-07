import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../../shared/listing-detail-modal/listing-detail-modal.component';

@Component({
  selector: 'app-sell-order-list-item',
  templateUrl: './sell-order-list-item.component.html',
  styleUrls: ['./sell-order-list-item.component.scss']
})
export class SellOrderListItemComponent implements OnInit {

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

}
