import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Log } from 'ng2-logger';

import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { Category } from 'app/core/market/api/category/category.model';
import { CategoryService } from 'app/core/market/api/category/category.service';

import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Template } from 'app/core/market/api/template/template.model';

interface ISorting {
  value: string;
  viewValue: string;
}

interface IPage {
  pageNumber: number,
  listings: Array<any>;
}

@Component({
  selector: 'app-overview-listings',
  templateUrl: './overview-listings.component.html',
  styleUrls: ['./overview-listings.component.scss']
})
export class OverviewListingsComponent implements OnInit, OnDestroy {

  log: any = Log.create('overview-listings.component');
  private destroyed: boolean = false;

  // filters
  countries: FormControl = new FormControl();
  countryList: Array<string> = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Moon'];

  search: string;

  // TODO? "Select with option groups" - https://material.angular.io/components/select/overview#creating-groups-of-options
  categories: FormControl = new FormControl();
  categoryList: Array<string> = [];

  _rootCategoryList: Category = new Category({});

  // sorting
  sortings: Array<ISorting> = [
    {value: 'newest', viewValue: 'Newest'},
    {value: 'popular', viewValue: 'Popular'},
    {value: 'price-asc', viewValue: 'Cheapest'},
    {value: 'price-des', viewValue: 'Most expensive'}
  ];

  pages: Array<IPage> = [];
  noMoreListings: boolean = false;

  // pagination
  pagination: any = {
    maxPages: 2,
    maxPerPage: 30,
    // hooks into the scroll bar of the main page..
    infinityScrollSelector: '.mat-drawer-content' // .mat-drawer-content
  };

  filters: any = {
    search:   undefined
  };

  constructor(
    private category: CategoryService,
    private listingService: ListingService,
    private marketState: MarketStateService
  ) {
    console.warn('overview created');
  }

  ngOnInit() {
    console.log('overview created');
    this.loadCategories();
    this.loadPage(1);

    this.getFavorites();
  }

  getFavorites() {
    this.marketState.observe('favorite').subscribe(res => {

      if (this.pages[0] && this.pages[0].listings) {
        console.log('>>>>>>>>>>>>>>>>>>>>>############>>>>>>>>>>>>', this.pages[0].listings);
        // @TODO compare two array and find fav. item
      }
    })
  }

  loadCategories() {
    this.category.list()
    .takeWhile(() => !this.destroyed)
    .subscribe(
      list => {
        this._rootCategoryList = list;
        this.categoryList = this._rootCategoryList.getSubCategoryNames();
      });
  }

  loadPage(pageNumber: number, clear?: boolean) {
    const max = this.pagination.maxPerPage;

    const search = this.filters.search;

    this.listingService.search(pageNumber, max, null, search)
      .take(1)
      .subscribe((listings: Array<any>) => {
        // new page
        const page = {
          pageNumber: pageNumber,
          listings: listings.map(listing => new Template(listing))
        };

        // should we clear all existing pages? e.g search
        if (clear === true) {
          this.pages = [page];
          this.noMoreListings = false;
        } else { // infinite scroll
          if (listings.length > 0) {
            this.pushNewPage(page);
          } else {
            this.noMoreListings = true;
          }
        }

      })
  }

  pushNewPage(page: IPage) {
    const newPageNumber = page.pageNumber;
    let goingDown = true; // direction

    // previous page
    if (this.pages[0] && this.pages[0].pageNumber > newPageNumber) {
      console.log('adding page to top');
      this.pages.unshift(page);
      goingDown = false;
    } else { // next page
      console.log('adding page to bottom');
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

  clearAndLoadPage() {
    this.loadPage(1, true);
  }

  // TODO: fix scroll up!
  loadPreviousPage() {
    console.log('prev page trigered');
    let previousPage = this.getFirstPageCurrentlyLoaded();
    previousPage--;
    console.log('loading prev page' + previousPage);
    if (previousPage > 0) {
      this.loadPage(previousPage);
    }
  }

  loadNextPage() {
    let nextPage = this.getLastPageCurrentlyLoaded(); nextPage++;
    console.log('loading next page: ' + nextPage);
    this.loadPage(nextPage);
  }

  // Returns the pageNumber of the last page that is currently visible
  getLastPageCurrentlyLoaded() {
    return this.pages[this.pages.length - 1].pageNumber;
  }

  // Returns the pageNumber if the first page that is currently visible
  getFirstPageCurrentlyLoaded() {
    return this.pages[0].pageNumber;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
