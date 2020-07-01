import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, iif, merge, of, defer, combineLatest } from 'rxjs';
import { takeUntil, concatMap, tap, debounceTime, distinctUntilChanged, map, take, switchMap, catchError } from 'rxjs/operators';
import { xor } from 'lodash';
import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { DataService } from '../services/data/data.service';
import { RegionListService } from '../services/region-list/region-list.service';
import { ListingsService } from './listings.service';

import { Market, CategoryItem, Country } from '../services/data/data.models';
import { ListingDetailModalComponent } from './../shared/listing-detail-modal/listing-detail-modal.component';
import { ListingOverviewItem } from './listings.models';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';


enum TextContent {
  FAILED_LOAD_LISTINGS = 'Failed to load listings. Please try again',
  FAILED_LOAD_DETAILS = 'Could not load listing details. Please try again shortly'
}


@Component({
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsComponent implements OnInit, OnDestroy {

  // for easy rendering only
  marketsList: Market[] = [];
  activeMarket: Market;
  hasNewListings: boolean = false;          // TODO: Make this do something useful...
  atEndOfListings: boolean = false;
  isSearching: boolean = false;
  isLoadingListings: boolean = true;


  // filter/search control mechanisms
  searchQuery: FormControl = new FormControl('');
  filterCategory: FormControl = new FormControl([]);
  filterSourceRegion: FormControl = new FormControl([]);
  filterTargetRegion: FormControl = new FormControl([]);
  filterFlagged: FormControl = new FormControl(false);
  filterSeller: FormControl = new FormControl('');
  // refresh action
  actionRefresh: FormControl = new FormControl();
  // scroll action
  actionScroll: FormControl = new FormControl();

  // list items for filter selections
  categoriesList$: Observable<CategoryItem[]>;
  countryList$: Observable<Country[]>;

  listings: ListingOverviewItem[] = [];


  private destroy$: Subject<void> = new Subject();
  private market$: Subject<Market> = new Subject();
  private categorySource$: Subject<CategoryItem[]> = new Subject();

  private availableMarkets: Market[] = [];

  private PAGE_COUNT: number = 40;


  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _listingService: ListingsService,
    private _sharedService: DataService,
    private _regionService: RegionListService,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService
  ) {
    this.categoriesList$ = this.categorySource$.asObservable().pipe(takeUntil(this.destroy$));
    this.countryList$ = of(this._regionService.getCountryList()).pipe(
      map((countries) => {
        return countries.map(c => ({id: c.iso, name: c.name}));
      }),
      take(1)
    );
  }


  ngOnInit() {

    // If the identity changes, fetch the selected identitys' markets.
    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      concatMap((iden) => iif(() => iden && iden.id > 0,
        this._sharedService.loadMarkets(0, iden.id).pipe(
          tap((markets: Market[]) => {
            this.availableMarkets = markets;
            this.market$.next(null);
          })
        ))
      ),
      takeUntil(this.destroy$)
    );

    // When the market form field changes (user selected a new market/identity changed/whatever), ensure we have a valid market
    //  and then load the categories for that market,
    //  and then reset filters ( causing a new listings lookup to be generated :) )
    const marketChange$ = this.market$.pipe(
      map((market: Market) => {
        let selectedMarket: Market = market || this.activeMarket;

        if (selectedMarket) {
          selectedMarket = this.availableMarkets.find(m => m.id === selectedMarket.id);
        }
        if (!selectedMarket) {
          selectedMarket = this.availableMarkets[0];
        }

        const updatedID = (selectedMarket && selectedMarket.id) || 0;
        if (updatedID) {
          this.activeMarket = selectedMarket;
          this.marketsList = this.availableMarkets.filter(m => m.id !== this.activeMarket.id);
        }
        return selectedMarket;
      }),
      concatMap((market: Market) => iif(() => !!market,
        // load the categories for the selected market
        this._sharedService.loadCategories(+market.id).pipe(
          tap((categories) => {
            this.categorySource$.next(categories.categories);
          })
        )
      )),
      tap(() => {
        this.resetFilters();
      }),
      takeUntil(this.destroy$)
    );


    // search/filter watchers

    const search$ = this.searchQuery.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const category$ = this.filterCategory.valueChanges.pipe(
      distinctUntilChanged((prev: number[], curr: number[]) => (xor(prev, curr)).length === 0),
      takeUntil(this.destroy$)
    );

    const sourceRegion$ = this.filterSourceRegion.valueChanges.pipe(
      distinctUntilChanged((prev: string[], curr: string[]) => prev[0] === curr[0]),
      map((selected) => selected[0]),
      takeUntil(this.destroy$)
    );

    const destRegion$ = this.filterTargetRegion.valueChanges.pipe(
      distinctUntilChanged((prev: string[], curr: string[]) => prev[0] === curr[0]),
      takeUntil(this.destroy$)
    );

    const seller$ = this.filterSeller.valueChanges.pipe(
      distinctUntilChanged((prev: string, curr: string) => prev === curr),
      takeUntil(this.destroy$)
    );

    const criteria$ = [
      search$,
      category$,
      sourceRegion$,
      destRegion$,
      seller$
    ];

    const filters$ = combineLatest(...criteria$).pipe(
      tap(() => this.listings = []),
      takeUntil(this.destroy$));

    const refresh$ = this.actionRefresh.valueChanges.pipe(
      tap(() => {
        this.listings = [];
      }),
      takeUntil(this.destroy$)
    );

    const flagged$ = this.filterFlagged.valueChanges.pipe(
      tap(() => {
        this.listings = [];
      }),
      takeUntil(this.destroy$)
    );

    const scrolled$ = this.actionScroll.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    // observable subscriptions and handling...
    // ...this one for loading listings
    merge(
      refresh$,
      flagged$,
      filters$,
      scrolled$
    ).pipe(

      tap(() => {
        this.isLoadingListings = true;

        // check for whether we're filtering/seaching
        let isSearching = false;
        const defaults = this.getDefaultFilterValues();
        const fields = Object.keys(defaults);

        for (const field of fields) {
          try {
            const defaultValue = defaults[field];
            if (['number', 'string'].includes(typeof defaultValue)) {
              isSearching = (this[field] as FormControl).value !== defaultValue;
            } else {
              isSearching = JSON.stringify((this[field] as FormControl).value) !== JSON.stringify(defaultValue);
            }
          } catch (err) {
            // oops
          }
          if (isSearching) {
            break;
          }
        }

        this.isSearching = isSearching;

        // force view update here
        this._cdr.detectChanges();
      }),

      switchMap(() => this.fetchMarketListings(this.PAGE_COUNT).pipe(

        catchError(() => {
          this._snackbar.open(TextContent.FAILED_LOAD_LISTINGS, 'err');
          return of(false);
        }),

        tap(() => {
          this.isLoadingListings = false;
          this._cdr.detectChanges();  // force view update again here
        }),
      )),

      takeUntil(this.destroy$)

    ).subscribe();

    // ...this one for watching the "global" changes
    merge(
      marketChange$,
      identityChange$
    ).subscribe();

  }


  ngOnDestroy() {
    this.market$.complete();
    this.categorySource$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByListingFn(_: number, item: any) {
    return item.id;
  }


  changeMarket(market: Market) {
    this.market$.next(market);
  }


  openListingDetailModal(id: number): void {
    // TODO: IMPLEMENT THIS
    this._listingService.getListingDetails(id).subscribe(
      (listing) => {
        if (+listing.id > 0) {
          const dialog = this._dialog.open(
            ListingDetailModalComponent,
            {data: {listing, canChat: true, canAction: true}}
          );
        } else {
          this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn');
        }
      },

      (err) => this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn')
    );

  }


  private fetchMarketListings(numItems: number): Observable<boolean> {
    const itemCount = this.listings.length;
    return this._listingService.searchListingItems(
      (this.activeMarket && this.activeMarket.receiveAddress) || '',
      Math.floor(itemCount / numItems),
      numItems,
      this.searchQuery.value,
      this.filterCategory.value,
      this.filterSeller.value,
      this.filterSourceRegion.value[0],
      this.filterTargetRegion.value[0],
      this.filterFlagged.value
    ).pipe(
      map(items => {
        this.atEndOfListings = (items.length > 0) && (items.length < numItems);
        // Remove duplicated listings: this may happen if earlier listings expired
        //   - in which case the MP search queries may ignore them from the resultset returned, thus causing some overlap
        //   - we only really need to check one PAGE_COUNT of the previous existing listing items
        const found = [];
        for (let ii = 0; ii < items.length; ii++) {
          const item = items[ii];

          for (let jj = 0; jj < Math.min(this.PAGE_COUNT, itemCount); jj++) {
            const existing = this.listings[this.listings.length - 1 - jj];
            if (existing.id === item.id) {
              found.push(item.id);
            }
          }
        }

        if (found.length > 0) {
          items = items.filter(item => !found.includes(item.id));
        }

        this.listings.push(...items);
        return found.length;
      }),

      concatMap(loadMore => iif(
        () => (loadMore > 0) && (numItems > 5) && (loadMore > (numItems / 5)),
        defer(() => this.fetchMarketListings(loadMore)),
        defer(() => of(true))
      ))
    );
  }


  private resetFilters(): void {
    const defaults = this.getDefaultFilterValues();
    const fields = Object.keys(defaults);
    for (const field of fields) {
      try {
        (this[field] as FormControl).setValue(defaults[field]);
      } catch (err) {
        // oops
      }
    }
  }


  private getDefaultFilterValues(): {[key: string]: any} {
    return {
      searchQuery: '',
      filterCategory: [],
      filterSourceRegion: [],
      filterTargetRegion: [],
      filterSeller: ''
    };
  }

}
