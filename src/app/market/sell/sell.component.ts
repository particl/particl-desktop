import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { DeleteListingComponent } from '../../modals/delete-listing/delete-listing.component';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Template } from 'app/core/market/api/template/template.model';

import { Status } from './status.class';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent implements OnInit {
  public status: Status = new Status();

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['listings', 'orders', 'sell_item']; // FIXME: remove sell_item and leave as a separate page?

  // order type
  orderType: string = 'sell';

  filters: any = {
    search:   undefined,
    sort:     undefined,
    status:   undefined
  };

  public listings: Array<any>;

  public search: string = '';
  public category: string = '';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private template: TemplateService,
    private listing: ListingService
  ) {}

  ngOnInit() {
    this.loadPage();
  }

  addItem(id?: number, clone?: boolean) {
    this.router.navigate(['/market/template'], {
      queryParams: {'id': id, 'clone': clone }
    });
  }

  clear(): void {
    this.filters = {
      search:   undefined,
      sort:     undefined,
      status:   undefined
    };
    this.loadPage();
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  confirmDeleteListing(template: Template): void {
    const dialogRef = this.dialog.open(DeleteListingComponent);
    dialogRef.componentInstance.templateToRemove = template;
    dialogRef.afterClosed().subscribe(
      () => this.loadPage()
    );
  }

  loadPage() {
    const category = this.filters.category ? this.filters.category : null;
    const search = this.filters.search ? this.filters.search : null;
    this.template.search(1, 10, 1, category, search).subscribe(
      (listings: Array<Template>) => {
        console.log(listings);
        this.listings = listings;
      }
    )
  }

  // Triggered when the action button is clicked.
  action(listing: any) {
    switch (listing.status) {
      case 'unpublished': 
        this.postTemplate(listing.id);
        break;
      case 'published': 
        break;
    }
  }

  postTemplate(id: any) {
    this.template.post(id, 1).take(1).subscribe(listing => {
        console.log(listing);
      });
  }

  getStatus(status: string) {
    return [this.status.get(status)];
  }
}
