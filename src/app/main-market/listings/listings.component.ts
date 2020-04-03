import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject, iif, merge, of } from 'rxjs';
import { xor } from 'lodash';
import { takeUntil, concatMap, tap, debounceTime, distinctUntilChanged, map, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { ListingsService } from './listings.service';

import { Market, CategoryItem, Country } from './listings.models';
import { RegionListService } from '../shared/shared.module';


@Component({
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
  providers: [ListingsService]
})
export class ListingsComponent implements OnInit, OnDestroy {

  // for easy rendering only
  marketsList: Market[] = [];
  activeMarket: Market;
  hasNewListings: boolean = false;    // TODO: Make this do something useful...
  isSearching: boolean = false;       // TODO: Make this do something useful...
  isLoadingListings: boolean = false; // TODO: Make this do something useful...
  reachedListingsEnd: boolean = false;  // TODO: Make this do something useful...


  // filter/search control mechanisms
  searchQuery: FormControl = new FormControl('');
  filterCategory: FormControl = new FormControl([]);
  filterSourceRegion: FormControl = new FormControl([]);
  filterTargetRegion: FormControl = new FormControl([]);
  filterFlagged: FormControl = new FormControl(false);
  actionRefresh: FormControl = new FormControl();

  // list items for filter selections
  categoriesList$: Observable<CategoryItem[]>;
  countryList$: Observable<Country[]>;

  listings: any[] = [];       // TODO: Make this do something useful...


  private destroy$: Subject<void> = new Subject();
  private market$: Subject<Market> = new Subject();
  private categorySource$: Subject<CategoryItem[]> = new Subject();


  private availableMarkets: Market[] = [];

  constructor(
    private _store: Store,
    private _listService: ListingsService,
    private _regionService: RegionListService
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
    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      concatMap((iden) => iif(() => iden && iden.id > 0,
        this._listService.loadMarkets(0, iden.id).pipe(
          tap((markets: Market[]) => {
            this.availableMarkets = markets;
            this.market$.next(null);
          })
        ))
      ),
      takeUntil(this.destroy$)
    );

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
        // @TODO: zaSmilingIdiot 2020-04-03 -> change to use activeMarket receiveAddress
        // Its not using the receive address at present because we're not using custom categories right now.
        this._listService.loadCategories('').pipe(
          tap((categories: CategoryItem[]) => {
            this.categorySource$.next(categories);
          })
        )
      )),
      // !!!!!  TODO: RESET FILTERS HERE  !!!
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

    const targetRegion$ = this.filterTargetRegion.valueChanges.pipe(
      distinctUntilChanged((prev: string[], curr: string[]) => prev[0] === curr[0]),
      takeUntil(this.destroy$)
    );

    const flagged$ = this.filterFlagged.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    const criteria$ = [
      search$,
      category$,
      sourceRegion$,
      targetRegion$,
      flagged$
    ];

    merge(
      ...criteria$,
      this.actionRefresh.valueChanges.pipe(takeUntil(this.destroy$))
    ).pipe(
      switchMap(() => this.fetchMarketListings()),
      takeUntil(this.destroy$)
    ).subscribe();



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


  changeMarket(market: Market) {
    this.market$.next(market);
  }


  private fetchMarketListings(): Observable<[]> {
    // TODO: IMPLEMENT THIS (currently just a placeholder for the real lookup of listings)
    return of([]);
  }
}
