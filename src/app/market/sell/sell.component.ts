import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Template } from 'app/core/market/api/template/template.model';
import { take } from 'rxjs/operators';

interface IPage {
  pageNumber: number,
  listings: Array<any>;
}

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent implements OnInit {
  public isLoading: boolean = false;
  public isPageLoading: boolean = false;

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['listings', 'orders', 'sell_item']; // FIXME: remove sell_item and leave as a separate page?

  filters: any = {
    search:   undefined,
    sort:     undefined,
    status:   undefined
  };

  templateSearchSubcription: any;

  // public listings: Array<any>;
  pages: Array<IPage> = [];
  noMoreListings: boolean = false;

  // pagination
  pagination: any = {
    maxPages: 2,
    maxPerPage: 10,
    // hooks into the scroll bar of the main page..
    infinityScrollSelector: '.mat-drawer-content' // .mat-drawer-content
  };

  public search: string = '';
  public category: string = '';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private template: TemplateService,
    private listingService: ListingService,
  ) {}

  ngOnInit() {
    this.isPageLoading = true;
    this.loadPage(0);
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
    this.loadPage(0, true);
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  clearAndLoadPage() {
    this.loadPage(0, true);
  }

  loadPage(pageNumber: number, clear?: boolean) {
    this.isLoading = true;
    const category = this.filters.category ? this.filters.category : null;
    const search = this.filters.search ? this.filters.search : null;
    const max = this.pagination.maxPerPage;

    /*
      We store the subscription each time, due to API delays.
      A search might not resolve synchronically, so a previous search
      may overwrite a search that was initiated later on.
      So store the subscription, then stop listening if a new search
      or page load is triggered.
    */
    if (this.templateSearchSubcription) {
      this.templateSearchSubcription.unsubscribe();
    }

    this.templateSearchSubcription = this.template.search(pageNumber, max, 1, category, search)
      .pipe(take(1)).subscribe((listings: Array<Listing>) => {
        listings = listings.map((t) => {
        if (this.listingService.cache.isAwaiting(t)) {
          t.status = 'awaiting';
        }
        return t;
      });

      this.isLoading = false;
      // new page
      const page = {
        pageNumber: pageNumber,
        listings: listings
      };

      // should we clear all existing pages? e.g search
      if (clear === true) {
        this.pages = [page];
        this.noMoreListings = false;
      } else { // infinite scroll
        if (listings.length > 0) {
          this.pushNewPage(page);
          this.noMoreListings = false;
        } else {
          this.noMoreListings = true;
        }
      }
      this.isPageLoading = false;
    })
  }

  pushNewPage(page: IPage) {
    const newPageNumber = page.pageNumber;
    let goingDown = true; // direction

    // previous page
    if (this.pages[0] && this.pages[0].pageNumber > newPageNumber) {
      this.pages.unshift(page);
      goingDown = false;
    } else { // next page
      this.pages.push(page);
    }

    // if exceeding max length, delete a page of the other direction
    if (this.pages.length > this.pagination.maxPages) {
      if (goingDown) {
        this.pages.shift(); // delete first page
      } else {
        this.pages.pop(); // going up, delete last page
      }
    }
  }
  // TODO: fix scroll up!
  loadPreviousPage() {
    let previousPage = this.getFirstPageCurrentlyLoaded();
    previousPage--;
    if (previousPage > -1) {
      this.loadPage(previousPage);
    }
  }

  loadNextPage() {
    let nextPage = this.getLastPageCurrentlyLoaded(); nextPage++;
    this.loadPage(nextPage);
  }

  // Returns the pageNumber of the last page that is currently visible
  getLastPageCurrentlyLoaded() {
    return this.pages.length > 0 && this.pages[this.pages.length - 1].pageNumber;
  }

  // Returns the pageNumber if the first page that is currently visible
  getFirstPageCurrentlyLoaded() {
    return this.pages[0].pageNumber;
  }

  // Delete the listing using index
  deleteListing(pageIndex: number, listingIndex: number) {
    this.pages[pageIndex].listings.splice(listingIndex, 1);
  }

}
