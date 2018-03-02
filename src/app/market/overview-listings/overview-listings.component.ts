import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { Category } from 'app/core/market/api/category/category.model';
import { CategoryService } from 'app/core/market/api/category/category.service';

import { ListingService } from 'app/core/market/api/listing/listing.service';

interface ISorting {
  value: string;
  viewValue: string;
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

  listings: Array<any> = [];
  noMoreListings: boolean = false;

  // pagination
  pagination: any = {
    currentPage: 1,
    maxPerPage: 30,
    // hooks into the scroll bar of the main page..
    infinityScrollSelector: '.mat-drawer-content'
  }

  filters: any = {
    search:   undefined
  };

  constructor(
    private category: CategoryService,
    private listingService: ListingService
  ) {
    console.warn('overview created');
  }

  ngOnInit() {
    console.log('overview created');
    this.loadCategories();
    this.loadPage();
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

  loadPage(clear?: boolean) {
    const page = this.pagination.currentPage;
    const max = this.pagination.maxPerPage;

    const search = this.filters.search;

    this.listingService.search(page, max, null, search).take(1).subscribe(listings => {
      if (clear === true) {
        this.listings = listings;
        this.noMoreListings = false;
      } else {
        if (listings.length > 0) {
          this.listings = this.listings.concat(listings);
        } else {
          this.noMoreListings = true;
        }
      }

    })
  }

  clearAndLoadPage() {
    this.pagination.currentPage = 1;
    this.loadPage(true);
  }

  loadNextPage() {
    this.pagination.currentPage++;
    this.loadPage();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
