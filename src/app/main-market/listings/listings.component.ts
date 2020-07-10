import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, iif, merge, of, defer, combineLatest, timer } from 'rxjs';
import { takeUntil, concatMap, tap, debounceTime, distinctUntilChanged, map, take, switchMap, catchError } from 'rxjs/operators';
import { xor } from 'lodash';
import { Store, Select } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { DataService } from '../services/data/data.service';
import { RegionListService } from '../services/region-list/region-list.service';
import { ListingsService } from './listings.service';

import { ListingDetailModalComponent } from '../shared/listing-detail-modal/listing-detail-modal.component';

import { Market, CategoryItem, Country } from '../services/data/data.models';
import { ListingOverviewItem } from './listings.models';
import { CartDetail } from '../store/market.models';


enum TextContent {
  FAILED_LOAD_LISTINGS = 'Failed to load listings. Please try again',
  FAILED_LOAD_DETAILS = 'Could not load listing details. Please try again shortly',
  FAILED_FAV_SET = 'The was an error while updating the item. Please try again shortly',
  CART_ADD_INVALID = 'The selected item cannot be added to the cart',
  CART_ADD_FAILED = 'Something went wrong adding the item to the cart',
  CART_ADD_DUPLICATE = 'That item is already in the cart',
  CART_ADD_SUCCESS = 'Successfully added to cart'
}


@Component({
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsComponent implements OnInit, OnDestroy {

  @Select(MarketState.availableCarts) availableCarts: Observable<CartDetail[]>;

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
  private timerExpire$: Subject<void> = new Subject();
  private market$: Subject<Market> = new Subject();
  private categorySource$: Subject<CategoryItem[]> = new Subject();

  private availableMarkets: Market[] = [];
  private PAGE_COUNT: number = 60;
  private expiryValue: number = 0;


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


    const newMessages$ = this._listingService.getListenerNewListings().pipe(
      tap((resp) => {
        if (resp && (resp.market === this.activeMarket.receiveAddress)) {
          this.hasNewListings = true;
          this._cdr.detectChanges();
        }
      }),
      catchError(() => of()),
      takeUntil(this.destroy$)
    );

    // If the identity changes, fetch the selected identity's markets.
    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      concatMap((iden) => iif(() => iden && iden.id > 0,
        this._sharedService.loadMarkets(iden.id).pipe(
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

    const filterActions = [
      search$,
      category$,
      sourceRegion$,
      destRegion$,
      seller$
    ];

    const filters$ = combineLatest(...filterActions).pipe(takeUntil(this.destroy$));
    const refresh$ = this.actionRefresh.valueChanges.pipe(takeUntil(this.destroy$));
    const flagged$ = this.filterFlagged.valueChanges.pipe(takeUntil(this.destroy$));

    const reset$ = merge(filters$, refresh$, flagged$).pipe(
      tap(() => {
        this.listings = [];
      }),
      takeUntil(this.destroy$)
    );

    const scrolled$ = this.actionScroll.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    // actually do the loading of listings when necessary
    const loadListings$ = merge(
      reset$,
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

        if (!this.isSearching && (this.listings.length === 0) && !this.filterFlagged.value) {
          this.hasNewListings = false;
        }

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

    );

    merge(
      loadListings$,
      marketChange$,
      identityChange$,
      newMessages$
    ).subscribe();

  }


  ngOnDestroy() {
    this.listings = [];
    this.market$.complete();
    this.categorySource$.complete();
    this.timerExpire$.next();
    this.timerExpire$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByListingFn(_: number, item: any) {
    return item.id;
  }


  changeMarket(market: Market) {
    this.market$.next(market);
  }


  updateFav(listingIdx: number, action: 'ADD' | 'REMOVE') {
    const listing: ListingOverviewItem = this.listings[listingIdx];
    if (
      this.isLoadingListings ||
      !listing ||
      ((action === 'ADD') && listing.extras.favouriteId) ||
      ((action === 'REMOVE') && !listing.extras.favouriteId)
    ) {
      return;
    }

    let obs$: Observable<boolean | number | null>;
    if (action === 'ADD') {
      obs$ = this._listingService.addFavourite(listing.id);
    } else if (action === 'REMOVE') {
      obs$ = this._listingService.removeFavourite(listing.extras.favouriteId);
    }

    if (obs$) {
      obs$.subscribe(
        (resp) => {
          let success = false;
          if (action === 'ADD') {
            if (typeof resp === 'number' && resp) {
              listing.extras.favouriteId = resp as number;
              success = true;
            }
          } else if (action === 'REMOVE') {
            if (typeof resp === 'boolean' && resp) {
              listing.extras.favouriteId = null;
              success = true;
            }
          }

          if (success) {
            this._cdr.detectChanges();  // force refresh here
          } else {
            this._snackbar.open(TextContent.FAILED_FAV_SET, 'warn');
          }
        }
      );

    }
  }


  openListingDetailModal(id: number): void {
    this._sharedService.getListingDetails(id).subscribe(
      (listing) => {
        if (+listing.id > 0) {
          const dialog = this._dialog.open(
            ListingDetailModalComponent,
            {data: {listing, canChat: true, canAction: true}}
          );
          // TODO: Link dialog actions back to applicable actions here
        } else {
          this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn');
        }
      },

      (err) => this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn')
    );

  }


  addItemToCart(listingIndex: number, cartId: number) {
    if (!cartId || !(+listingIndex >= 0) || !(+listingIndex < this.listings.length) ) {
      return;
    }

    const listing = this.listings[listingIndex];
    if (!listing || !listing.id || !listing.extras.canAddToCart) {
      this._snackbar.open(TextContent.CART_ADD_INVALID, 'err');
      return;
    }

    this._listingService.addItemToCart(listing.id, cartId).subscribe(
      () => {
        this._snackbar.open(TextContent.CART_ADD_SUCCESS);
      },
      (err) => {
        let msg = TextContent.CART_ADD_FAILED;
        if (err === 'ListingItem already added to ShoppingCart') {
          msg = TextContent.CART_ADD_DUPLICATE;
        }
        this._snackbar.open(msg, 'warn');
      }
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
        // stop the expiration checking timer: safety measure
        //  (it is stopped properly later, but just to prevent any unnecessary side effects of delayed processing,
        //  we force any running timer to stop here as well).
        this.timerExpire$.next();

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

        // Update the expiration timer checking value if necessary
        const leastTime = items.filter(
          i => i.extras.canAddToCart && (i.expiry > 0)
        ).sort(
          (a, b) => a.expiry - b.expiry
        )[0];

        if (leastTime && ((leastTime.expiry < this.expiryValue) || (this.expiryValue === 0))) {
          this.expiryValue = leastTime.expiry;
        }

        // (re)start the expiration checking timer
        this.startExpirationTimer();

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


  private startExpirationTimer(): void {
    // ensure that existing timers are stopped
    this.timerExpire$.next();

    if (this.expiryValue === 0) {
      return;
    }
    const countdown = this.expiryValue - Date.now();

    timer(countdown > 0 ? countdown : 100).pipe(
      tap(() => {
        let newTime = Number.MAX_SAFE_INTEGER;
        let shouldUpdate = false;
        const now = Date.now();

        this.listings.forEach(item => {
          if (item.extras.canAddToCart && item.expiry <= (now + 5000)) {
            item.extras.canAddToCart = false;
            shouldUpdate = true;
          }
          if (item.extras.canAddToCart && (item.expiry < newTime)) {
            newTime = item.expiry;
          }
        });

        this.expiryValue = newTime === Number.MAX_SAFE_INTEGER ? 0 : newTime;

        if (shouldUpdate) {
          this._cdr.detectChanges();
        }
      }),
      takeUntil(this.timerExpire$)
    ).subscribe(
      () => this.startExpirationTimer()
    );
  }

}
