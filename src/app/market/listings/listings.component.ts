import { Component, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { Category } from 'app/core/market/api/category/category.model';
import { Listing } from '../../core/market/api/listing/listing.model';

import { CategoryService } from 'app/core/market/api/category/category.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { FavoritesService } from '../../core/market/api/favorites/favorites.service';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { take } from 'rxjs/operators';
import { throttle } from 'lodash';


interface ISorting {
  value: string;
  viewValue: string;
}

interface IPage {
  pageNumber: number,
  listings: Array<any>;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss']
})

export class ListingsComponent implements OnInit, OnDestroy {
  // general
  log: any = Log.create('listing-item.component');
  private destroyed: boolean = false;

  // loading
  public isLoading: boolean = false; // small progress bars
  public isLoadingBig: boolean = true; // big animation

  // filters
  // countries: FormControl = new FormControl();
  search: string;
  flagged: boolean = false;
  listingServiceSubcription: any;
  private resizeEventer: any;
  // categories: FormControl = new FormControl();

  _rootCategoryList: Category = new Category({});

  // sorting
  sortings: Array<ISorting> = [
    { value: 'newest', viewValue: 'Newest' },
    { value: 'popular', viewValue: 'Popular' },
    { value: 'price-asc', viewValue: 'Cheapest' },
    { value: 'price-des', viewValue: 'Most expensive' }
  ];

  pages: Array<IPage> = [];
  noMoreListings: boolean = false;

  // pagination
  pagination: any = {
    maxPages: 3,
    maxPerPage: 24,
    // hooks into the scroll bar of the main page..
    infinityScrollSelector: '.mat-drawer-content' // .mat-drawer-content
  };

  filters: any = {
    category: undefined,
    search: undefined,
    country: undefined
  };

  selectedCountry: Country;

  // used to check for new listings
  private firstListingHash: string = '';
  private timeoutNewListingCheck: any;
  newListArrived: boolean;

  constructor(
    private category: CategoryService,
    private listingService: ListingService,
    private favoritesService: FavoritesService,
    public countryList: CountryListService
  ) {
    this.log.d('overview created');
    if (this.listingService.cache.selectedCountry) {
      this.selectedCountry = this.listingService.cache.selectedCountry
    }
    this.getScreenSize();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadPage(0, true);
    this.resizeEventer = throttle(() => this.getScreenSize(), 400, { leading: false, trailing: true });
    try {
      window.addEventListener('resize', this.resizeEventer);
    } catch (err) { }
  }

  loadCategories() {
    this.category.list()
      .subscribe(
      list => {
        this._rootCategoryList = list;
      });
  }

  private loadPage(pageNumber: number, clear: boolean, queryNewListings: boolean = false) {
    // set loading aninmation
    this.isLoading = !queryNewListings;

    // params
    const max = this.pagination.maxPerPage;
    const search = this.filters.search;
    const category = this.filters.category;
    const country = this.filters.country;

    /*
      We store the subscription each time, due to API delays.
      A search might not resolve synchronically, so a previous search
      may overwrite a search that was initiated later on.
      So store the subscription, then stop listening if a new search
      or page load is triggered.
    */
    if (this.listingServiceSubcription) {
      this.listingServiceSubcription.unsubscribe();
    }

    if ((queryNewListings || (pageNumber === 0 && clear)) && this.timeoutNewListingCheck) {
      try {
        clearTimeout(this.timeoutNewListingCheck);
      } catch (err) { }
    }

    this.listingServiceSubcription = this.listingService.search(pageNumber, max, null, search, category, country, this.flagged)
      .pipe(take(1)).subscribe((listings: Array<Listing>) => {

        if (this.destroyed) {
          return;
        }
        this.isLoading = false;
        this.isLoadingBig = false;

        if (queryNewListings) {
          // Queried for new listings available - are there any new ones?
          this.newListArrived = listings.length && (listings[0].hash || '') !== this.firstListingHash;
        } else {

          // new page
          const page = {
            pageNumber: pageNumber,
            listings: listings
          };

          if ( (pageNumber === 0) && clear) {
            this.firstListingHash = listings.length ? (listings[0].hash || '') : '';
            this.newListArrived = false;
          }

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
        }

        if (queryNewListings || (pageNumber === 0 && clear)) {
          // Check for new listings if this is such a request, or a new result set is being loaded
          if (!this.destroyed) {
            this.timeoutNewListingCheck = setTimeout(() => {
              if (!this.destroyed) {
                this.loadPage(0, false, true);
              }
            }, 20000);
          }
        }
      },

      (error) => {
        setTimeout(() => {
          if (!this.destroyed) {
            this.loadPage(0, clear, queryNewListings);
          }
        }, 5000);
      }
      )
  }

  pushNewPage(page: IPage) {
    const newPageNumber = page.pageNumber;
    let goingDown = true; // direction

    // previous page
    if (this.pages[0] && this.pages[0].pageNumber > newPageNumber) {
      this.log.d('adding page to top');
      this.pages.unshift(page);
      goingDown = false;
    } else { // next page
      this.log.d('adding page to bottom');
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
    this.loadPage(0, true);
  }

  // TODO: fix scroll up!
  loadPreviousPage() {
    this.log.d('prev page trigered');
    if (this.pages.length) {
      let previousPage = this.pages[0].pageNumber;
      previousPage--;
      this.log.d('loading prev page' + previousPage);
      if (previousPage > -1) {
        this.loadPage(previousPage, false);
      }
    }
  }

  loadNextPage() {
    if (this.pages.length) {
      let nextPage = this.pages[this.pages.length - 1].pageNumber; nextPage++;
      this.log.d('loading next page: ' + nextPage);
      this.loadPage(nextPage, false);
    }
  }

  changeLocation(country: Country) {
    this.listingService.cache.selectedCountry = country || undefined;
  }

  onCountryChange(country: Country): void {
    this.filters.country = country ? country.iso : undefined;
    this.clearAndLoadPage();
  }

  onCategoryChange(category: any): void {
    if (!category || category.id) {
      this.filters.category = category ? category.id : undefined;
      this.clearAndLoadPage();
    }

  }

  toggleFlag(event: any): void {
    this.flagged = event.source.checked;
    this.loadPage(0, true);
  }

  getScreenSize() {
    const currentMaxPerPage = this.pagination.maxPerPage;
    const newMaxPerPage = window.innerHeight > 1330 ? 20 : 10;
    const isLarger = (newMaxPerPage - currentMaxPerPage) > 0;

    if (isLarger) {
      // Load more pages to fill the screen
      // maxPages 2 -> 3, ensure no pages are deleted when loading
      // the next page.
      this.pagination.maxPages = 3;
      this.pagination.maxPerPage = newMaxPerPage;
      this.loadNextPage();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    try {
      clearTimeout(this.timeoutNewListingCheck);
    } catch (err) { }
    try {
      window.removeEventListener('resize', this.resizeEventer);
    } catch (err) { }
  }
}
