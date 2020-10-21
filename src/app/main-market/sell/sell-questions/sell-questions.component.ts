import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../../shared/listing-detail-modal/listing-detail-modal.component';

@Component({
  selector: 'market-sell-questions',
  templateUrl: './sell-questions.component.html',
  styleUrls: ['./sell-questions.component.scss']
})
export class SellQuestionsComponent implements OnInit {

  searchQuery: FormControl = new FormControl('');

  filters: any = {
    search:   ''
  };

  listing_filtering_market: Array<any> = [
    { title: 'All Markets',     value: 'one' },
    { title: 'Particl Open Marketplace',     value: 'two' },
    { title: 'Sneaky Market',   value: 'three' }
  ];

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

  clearAndLoadPage() {

  }

  clearAllFilters() {

  }

}
