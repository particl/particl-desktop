import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, iif, merge, of, defer, timer, from } from 'rxjs';
import { takeUntil, concatMap, tap, debounceTime, distinctUntilChanged, map, take, switchMap,
  catchError, filter, mapTo, finalize, concatAll, last } from 'rxjs/operators';
import { xor } from 'lodash';
import { Store, Select } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { MainState } from 'app/main/store/main.state';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { DataService } from '../services/data/data.service';
import { RegionListService } from '../services/region-list/region-list.service';
import { ListingsService } from './listings.service';

import { ListingDetailModalComponent } from '../shared/listing-detail-modal/listing-detail-modal.component';
import { TreeSelectComponent } from '../shared/shared.module';

import { isBasicObjectType } from '../shared/utils';
import { Market, CategoryItem, Country } from '../services/data/data.models';
import { ListingOverviewItem } from './listings.models';
import { CartDetail, MarketSettings } from '../store/market.models';


enum TextContent {
  FAILED_LOAD_LISTINGS = 'Failed to load listings. Please try again',
  FAILED_LOAD_DETAILS = 'Could not load listing details. Please try again shortly',
  FAILED_FAV_SET = 'The was an error while updating the item. Please try again shortly',
  CART_ADD_INVALID = 'The selected item cannot be added to the cart',
  CART_ADD_FAILED = 'Something went wrong adding the item to the cart',
  CART_ADD_DUPLICATE = 'That item is already in the cart',
  CART_ADD_SUCCESS = 'Successfully added to cart',
  ITEM_FLAG_SUCCESS = 'Successfully flagged the listing',
  ITEM_FLAG_FAILED = 'An error occurred while flagging the listing',
}


@Component({
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsComponent implements OnInit, OnDestroy {

  @Select(MarketState.availableCarts) availableCarts: Observable<CartDetail[]>;
  @Select(MarketState.settings) marketSettings: Observable<MarketSettings>;

  activeMarket: Market;
  selectedMarketControl: FormControl = new FormControl(0);

  // flags controlling what's displayed when
  newPendingListingCount: number = 0;
  atEndOfListings: boolean = false;
  isSearching: boolean = false;
  isLoadingListings: boolean = true;
  isRescanningListings: boolean = false;
  isSystemSyncing: boolean = false;

  // filter/search control mechanisms
  searchQuery: FormControl = new FormControl('');
  filterCategory: FormControl = new FormControl([]);
  filterSourceRegion: FormControl = new FormControl([]);
  filterTargetRegion: FormControl = new FormControl([]);
  filterFlagged: FormControl = new FormControl(false);
  filterSeller: FormControl = new FormControl('');
  // actionable mechanisms
  actionRefresh: FormControl = new FormControl();
  actionScroll: FormControl = new FormControl();

  // lists of things
  categoriesList$: Observable<CategoryItem[]>;
  countryList$: Observable<Country[]>;

  listings: ListingOverviewItem[] = [];
  marketsList: Market[] = [];


  private destroy$: Subject<void> = new Subject();
  private timerExpire$: Subject<void> = new Subject();
  private categorySource$: Subject<CategoryItem[]> = new Subject();
  private listingExpirations: number[];

  private PAGE_COUNT: number = 80;
  private expiryValue: number = 0;
  private forceReload$: FormControl = new FormControl();
  @ViewChild('categorySelection', {static: false}) private componentCategory: TreeSelectComponent;
  @ViewChild('countrySourceSelection', {static: false}) private componentCountrySource: TreeSelectComponent;
  @ViewChild('countryDestinationSelection', { static: false }) private componentCountryDestination: TreeSelectComponent;

  private readonly ROUTE_TO_MARKET_JOIN: string = '/main/market/management/';
  private readonly ROUTE_TO_MARKET_CREATE: string = '/main/market/management/create/';


  constructor(
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _listingService: ListingsService,
    private _sharedService: DataService,
    private _regionService: RegionListService,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService,
    private _unlocker: WalletEncryptionService,
  ) {
    this.categoriesList$ = this.categorySource$.asObservable().pipe(takeUntil(this.destroy$));
    this.countryList$ = of(this._regionService.getCountryList()).pipe(
      map((countries) => {
        return countries.map(c => ({id: c.iso, name: c.name}));
      }),
      take(1)
    );
    this.categorySource$.next([]);
  }


  ngOnInit() {

    let initialMarketIdSelected: number;

    const initParams = this._route.snapshot.queryParams;
    if (+initParams['SelectedMarketId'] > 0) {
      initialMarketIdSelected = +initParams['SelectedMarketId'];
    }

    // Websocket message update handlers

    const newMessageListings$ = this._listingService.getListenerNewListings().pipe(
      tap((resp) => {
        if (resp && this.activeMarket && (resp.market === this.activeMarket.receiveAddress)) {
          this.newPendingListingCount += 1;
          this._cdr.detectChanges();
        }
      }),
      catchError(() => of()),
      takeUntil(this.destroy$)
    );


    const blockSyncStatus$ = this._store.select(MainState.isBlockchainSynced()).pipe(
      tap((isSynced) => {
        if (!isSynced !== this.isSystemSyncing) {
          this.isSystemSyncing = !isSynced;
          this._cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    );


    const newMessageFlagged$ = this._listingService.getListenerFlaggedItems().pipe(
      filter(() => this.listings.length > 0),
      tap((resp) => {
        if (resp.market && this.activeMarket && (resp.market === this.activeMarket.receiveAddress) && (typeof resp.target === 'string')) {
          const listingsFound = this.listings.filter(l => l.hash === resp.target);
          if (listingsFound.length) {
            listingsFound.forEach(lf => lf.extras.isFlagged = true);
            this._cdr.detectChanges();
          }
        }
      }),
      catchError(() => of()),
      takeUntil(this.destroy$)
    );


    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      filter((identity) => isBasicObjectType(identity) && identity.id > 0),
      tap(() => {
        this.marketsList = [];
        this.listings = [];
        this.isLoadingListings = true;
        this._cdr.detectChanges();
      }),
      // could probably get the markets from the identity/profile on the store, since there should be a list of them available there
      switchMap((identity) => this._sharedService.loadMarkets(identity.id).pipe(
        catchError(() => of([] as Market[])),
        tap((markets: Market[]) => {
          this.marketsList = markets;


          let selectedMarket: Market;

          if (+initialMarketIdSelected > 0) {
            selectedMarket = this.marketsList.find(m => m.id === +initialMarketIdSelected);
            initialMarketIdSelected = 0;
          }

          if (!selectedMarket && isBasicObjectType(this.activeMarket) && this.activeMarket.id > 0) {
            selectedMarket = this.marketsList.find(m => m.id === +this.activeMarket.id);
          }

          if (!selectedMarket) {
            selectedMarket = this.marketsList[0];
          }

          this.selectedMarketControl.setValue(isBasicObjectType(selectedMarket) && (selectedMarket.id > 0) ? selectedMarket.id : 0);
        })
      )),
      takeUntil(this.destroy$)
    );


    const marketChange$ = this.selectedMarketControl.valueChanges.pipe(
      map((srcMarketId: number) => {
        let foundMarket;
        if (+srcMarketId > 0) {
          foundMarket = this.marketsList.find(m => m.id === +srcMarketId);
        }
        this.activeMarket = foundMarket;
        return isBasicObjectType(foundMarket) ? foundMarket.id : 0;
      }),

      concatMap(marketId => iif(
        () => +marketId > 0,

        defer(() => this.fetchMarketCategories(+marketId).pipe(
          tap(() => this.resetFilters())
        )),

        defer(() => {
          this.categorySource$.next([]);
          this.resetFilters();  // results in the reload of listings
        }),
      ))
    );


    const listingsReload$ = merge (
      this.searchQuery.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this.filterCategory.valueChanges.pipe(
        distinctUntilChanged((prev: number[], curr: number[]) => (xor(prev, curr)).length === 0),
        takeUntil(this.destroy$)
      ),

      this.filterSourceRegion.valueChanges.pipe(
        distinctUntilChanged((prev: string[], curr: string[]) => prev[0] === curr[0]),
        map((selected) => selected[0]),
        takeUntil(this.destroy$)
      ),

      this.filterTargetRegion.valueChanges.pipe(
        distinctUntilChanged((prev: string[], curr: string[]) => prev[0] === curr[0]),
        takeUntil(this.destroy$)
      ),

      this.filterSeller.valueChanges.pipe(
        distinctUntilChanged((prev: string, curr: string) => prev === curr),
        takeUntil(this.destroy$)
      ),

      this.actionRefresh.valueChanges.pipe(takeUntil(this.destroy$)),
      this.filterFlagged.valueChanges.pipe(takeUntil(this.destroy$)),
      this.forceReload$.valueChanges.pipe(takeUntil(this.destroy$))
    ).pipe(
      tap(() => {
        this.listings = [];
        this.listingExpirations = [];
      }),
      takeUntil(this.destroy$)
    );

    // actually do the loading of listings
    const loadListings$ = merge(
      listingsReload$,
      this.actionScroll.valueChanges.pipe(takeUntil(this.destroy$)),
    ).pipe(

      tap(() => {
        this.isLoadingListings = true;

        // check for whether we're filtering/searching
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
          this.newPendingListingCount = 0;
        }

        // force view update here
        this._cdr.detectChanges();
      }),

      switchMap(() => this.fetchMarketListings().pipe(
        tap(() => {
          this.isLoadingListings = false;
          this._cdr.detectChanges();  // force view update again here
        }),

        concatMap(() => iif(
          () => isBasicObjectType(this.activeMarket) && (this.activeMarket.type !== 'MARKETPLACE'),

          // refresh the market categories for correct filtering options.
          //  NB! fetching newly received items doesn't update the category list hence this step is required
          defer(() => this.fetchMarketCategories(this.activeMarket.id))
        ))
      )),

      takeUntil(this.destroy$)

    );

    merge(
      identityChange$,
      marketChange$,
      loadListings$,
      newMessageListings$,
      newMessageFlagged$,
      blockSyncStatus$,
    ).subscribe();

  }


  ngOnDestroy() {
    this.listings = [];
    this.categorySource$.complete();
    this.timerExpire$.next();
    this.timerExpire$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByListingFn(_: number, item: any) {
    return item.id;
  }


  clearSearchFilters(): void {
    this.resetFilters();
  }


  forceSmsgRescan() {
    this.isRescanningListings = true;
    this._cdr.detectChanges();
    this._listingService.forceSmsgRescan().pipe(
      finalize(() => {
        this.isRescanningListings = false;
        if (!this.destroy$.closed) {
          this._cdr.detectChanges();
        }
      })
    ).subscribe();
  }


  navigateToMarketJoin() {
    this._router.navigate([this.ROUTE_TO_MARKET_JOIN], {queryParams: {selectedManagementTab: 'browser'}});
  }

  navigateToMarketCreate() {
    this._router.navigate([this.ROUTE_TO_MARKET_CREATE]);
  }


  updateFav(listingIdx: number, action: 'ADD' | 'REMOVE'): void {
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
              listing.extras.favouriteId = 0;
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


  reportListing(listingIdx: number): void {
    const listing = this.listings[listingIdx];

    if (!listing || listing.extras.isFlagged) {
      return;
    }

    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap((unlocked: boolean) => iif(
        () => unlocked,
        defer(() => this._listingService.reportItem(listing.id).pipe(
            tap((success) => {
              const newListingRef = this.listings[listingIdx];
              if (newListingRef && newListingRef.id === listing.id) {
                const badHash = newListingRef.hash;
                const tobeRemoved: number[] = [];

                // looping over all listings because there is a need to remove potential duplicates as well
                for (let ii = 0; ii < this.listings.length; ii++) {
                  if (this.listings[ii].hash && (this.listings[ii].hash === badHash)) {
                    tobeRemoved.push(ii);
                  }
                }

                let successRemoved = 0;
                for (let ii = 0; ii < tobeRemoved.length; ii++) {
                  const actualIdx = tobeRemoved[ii] - successRemoved;
                  if (this.listings[actualIdx].hash === badHash) {
                    this.listings.splice(actualIdx, 1);
                    successRemoved++;
                  }
                }

                const modCount = this.listings.length % this.PAGE_COUNT;
                if (!this.atEndOfListings && (modCount > 0) && (modCount < (this.PAGE_COUNT / 2))) {
                  this.actionScroll.setValue(null);
                  // no need to update display here since the refreshing of the scrolled listings should take care of that
                } else {
                  this._cdr.detectChanges();
                }
              }
            })
          )
        )
      ))
    ).subscribe(
      () => this._snackbar.open(TextContent.ITEM_FLAG_SUCCESS),
      () => this._snackbar.open(TextContent.ITEM_FLAG_FAILED, 'warn')
    );
  }


  openListingDetailModal(id: number, startAtComments: boolean = false): void {
    this._sharedService.getListingDetailsForMarket(id, this.activeMarket.id).subscribe(
      (listing) => {
        if (+listing.id > 0) {
          const dialogRef = this._dialog.open(
            ListingDetailModalComponent,
            {
              data: {
                listing,
                canChat: true,
                initTab: startAtComments ? 'chat' : 'default',
                displayActions: {
                  cart: true,
                  governance: true,
                  fav: true
                }
              }
            }
          );

          let favId = listing.extra.favouriteId,
              proposalHash = listing.extra.flaggedProposal;

          dialogRef.componentInstance.eventFavouritedItem.subscribe(
            (newFavId) => favId = newFavId
          );

          dialogRef.componentInstance.eventFlaggedItem.subscribe(
            (flaggedHash: string | null) => proposalHash = flaggedHash
          );

          dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
            if ((favId !== listing.extra.favouriteId) || (proposalHash !== listing.extra.flaggedProposal)) {

              const foundListings = this.listings.filter(li => li.hash === listing.hash);
              for (const foundListing of foundListings) {
                if (foundListing.id === listing.id) {
                  foundListing.extras.favouriteId = favId;
                }
                foundListing.extras.isFlagged = foundListing.extras.isFlagged || proposalHash.length > 0;
              }
              this._cdr.detectChanges();
            }
          });

        } else {
          this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn');
        }
      },

      (err) => this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn')
    );

  }


  addItemToCart(listingIndex: number, cartId: number): void {
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


  private fetchMarketListings(): Observable<boolean> {
    return defer(() => {
      if (!this.activeMarket || !this.activeMarket.receiveAddress) {
        return of(false);
      }

      const currentCount = this.listings.length;
      const now = Date.now();
      const expiredCount = this.listingExpirations.filter(le => le <= now).length;
      const validCount = currentCount - expiredCount;
      const pageNum = Math.floor(validCount / this.PAGE_COUNT);
      const loadExtraPage = !Number.isInteger(validCount / this.PAGE_COUNT);

      // stop the expiration checking timer: safety measure
      //  (it is stopped properly later, but just to prevent any unnecessary side effects of delayed processing,
      //  we force any running timer to stop here as well).
      this.timerExpire$.next();

      const queries: Observable<any>[] = [];

      queries.push(
        defer(() => this._listingService.searchListingItems(
          (this.activeMarket && this.activeMarket.receiveAddress) || '',
          pageNum,
          this.PAGE_COUNT,
          this.searchQuery.value,
          this.filterCategory.value,
          this.filterSeller.value,
          this.filterSourceRegion.value[0],
          this.filterTargetRegion.value[0],
          this.filterFlagged.value
        ).pipe(
          map(items => {
            if (loadExtraPage) {
              // Remove duplicated listings: this may happen if earlier listings expired
              //   - in which case the MP search queries may ignore them from the resultset returned, thus causing some overlap
              const found = [];
              for (let ii = 0; ii < items.length; ii++) {
                const item = items[ii];

                for (let jj = 0; jj < this.PAGE_COUNT; jj++) {
                  const existing = this.listings[this.listings.length - 1 - jj];
                  if (existing.id === item.id) {
                    found.push(item.id);
                    break;
                  }
                }
              }

              return items.filter(i => !found.includes(i.id));
            }
            return items;
          }),
          tap(items => {
            this.listings.push(...items);
            this.listingExpirations.push(...items.map(i => +i.expiry || 0));
          })
        )
      ));

      if (loadExtraPage) {
        queries.push(
          defer(() => this._listingService.searchListingItems(
            (this.activeMarket && this.activeMarket.receiveAddress) || '',
            pageNum + 1,
            this.PAGE_COUNT,
            this.searchQuery.value,
            this.filterCategory.value,
            this.filterSeller.value,
            this.filterSourceRegion.value[0],
            this.filterTargetRegion.value[0],
            this.filterFlagged.value
          ).pipe(
            tap(items => {
              this.listings.push(...items);
              this.listingExpirations.push(...items.map(i => +i.expiry || 0));
            })
          )
        ));
      }

      // do the check to determine if there are more listings available
      queries.push(
        defer(() => this._listingService.searchListingItems(
          (this.activeMarket && this.activeMarket.receiveAddress) || '',
          this.listings.length,
          1,
          this.searchQuery.value,
          this.filterCategory.value,
          this.filterSeller.value,
          this.filterSourceRegion.value[0],
          this.filterTargetRegion.value[0],
          this.filterFlagged.value
        ).pipe(
          tap(items => {
            this.atEndOfListings = (this.listings.length > 0) && (items.length === 0);
          })
        ))
      );

      return from(queries).pipe(
        concatAll(),
        last(),
        tap(() => {
          // Update the expiration timer checking value if necessary
          const leastTime = this.listings.filter(
            i => i.extras.canAddToCart && (i.expiry > 0)
          ).sort(
            (a, b) => a.expiry - b.expiry
          )[0];

          if (leastTime && ((leastTime.expiry < this.expiryValue) || (this.expiryValue === 0))) {
            this.expiryValue = leastTime.expiry;
          }

          this.startExpirationTimer();
        }),
        mapTo(true),
        catchError(() => {
          this._snackbar.open(TextContent.FAILED_LOAD_LISTINGS, 'err');
          return of(false);
        })
      );

    });
  }


  private fetchMarketCategories(marketId: number): Observable<boolean> {
    return this._sharedService.loadCategories(+marketId).pipe(
      catchError(() => of({categories: []})),
      tap(categories => {
        this.categorySource$.next(categories.categories);
      }),
      mapTo(true)
    );
  }


  private resetFilters(): void {
    const defaults = this.getDefaultFilterValues();

    // reset the actual data components
    this.componentCategory.resetSelection(defaults.filterCategory);
    this.componentCountryDestination.resetSelection(defaults.filterTargetRegion);
    this.componentCountrySource.resetSelection(defaults.filterSourceRegion);

    // set the fields correctly
    const fields = Object.keys(defaults);
    for (const field of fields) {
      try {
        (this[field] as FormControl).setValue(defaults[field], {emitEvent: false});
      } catch (err) {
        // oops
      }
    }

    this.forceReload$.setValue(null);
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
