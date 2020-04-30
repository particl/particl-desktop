import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../listing-detail-modal/listing-detail-modal.component';

@Component({
  selector: 'app-listing-list-item',
  templateUrl: './listing-list-item.component.html',
  styleUrls: ['./listing-list-item.component.scss']
})
export class ListingListItemComponent implements OnInit {

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

}
