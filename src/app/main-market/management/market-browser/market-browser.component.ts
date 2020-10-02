import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, of, merge, Observable, defer } from 'rxjs';
import { catchError, tap, takeUntil, switchMap, startWith, debounceTime, distinctUntilChanged, concatMap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../management.service';
import { JoinWithDetailsModalComponent } from './join-with-details-modal/join-with-details-modal.component';
import { AvailableMarket } from '../management.models';


enum TextContent {
  LOAD_MARKETS_ERROR = 'Error while attempting to load available markets',
  JOIN_MARKET_SUCCESS = 'Market succesfsully added',
  JOIN_MARKET_ERROR_GENERIC = 'An error occurred while joining the market',
  JOIN_MARKET_ERROR_EXISTING = 'Market has already been joined',
  JOIN_MARKET_ERROR_PROFILE = 'Another identity has already joined this market',
  JOIN_MARKET_ERROR_NAME = 'Already joined another market with these details'
}


interface FilterOption {
  label: string;
  value: string;
}


@Component({
  selector: 'market-browser',
  templateUrl: './market-browser.component.html',
  styleUrls: ['./market-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketBrowserComponent implements OnInit, OnDestroy {

  optionsFilterMarketType: FilterOption[] = [
    { label: 'All markets',       value: '' },
    { label: 'Community Markets', value: '0' },
    { label: 'Storefronts',       value: '1' }
  ];

  optionsFilterMarketRegion: FilterOption[];

  searchControl: FormControl = new FormControl('');
  filterTypeControl: FormControl = new FormControl('');
  filterRegionControl: FormControl = new FormControl('');

  isLoading: boolean = true;
  displayedMarkets: number[] = [];
  marketsList: AvailableMarket[] = [];


  private destroy$: Subject<void> = new Subject();
  private renderFilteredControl: FormControl = new FormControl();


  constructor(
    private _cdr: ChangeDetectorRef,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) {
    this.optionsFilterMarketRegion = this._manageService.getMarketRegions();
  }


  ngOnInit() {
    // const load$ = this._manageService.searchAvailableMarkets().pipe(
    //   catchError(() => {
    //     this._snackbar.open(TextContent.LOAD_MARKETS_ERROR, 'warn');
    //     return of([] as AvailableMarket[]);
    //   }),
    //   tap(markets => {
    //     this.isLoading = false;
    //     this.marketsList = markets;
    //     this.renderFilteredControl.setValue(null);
    //   })
    // );


    const filterChange$ = merge(
      this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this.filterRegionControl.valueChanges.pipe(takeUntil(this.destroy$)),
      this.filterTypeControl.valueChanges.pipe(takeUntil(this.destroy$))
    ).pipe(
      tap(() => this.renderFilteredControl.setValue(null)),
      takeUntil(this.destroy$)
    );

    const render$ = this.renderFilteredControl.valueChanges.pipe(
      switchMap(() => this.getFilteredItems()),
      tap((indexes) => {
        this.displayedMarkets = this.marketsList.length > 0 ? indexes : [];
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );


    merge(
      this.loadMarkets(),
      filterChange$,
      render$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByMarketIdxFn(idx: number, item: number) {
    return item;
  }


  clearFilters(): void {
    this.searchControl.setValue('', {emitEvent: false});
    this.filterTypeControl.setValue('', {emitEvent: false});
    this.filterRegionControl.setValue('', {emitEvent: false});

    this.renderFilteredControl.setValue(null);
  }


  actionJoinMarket(idx: number): void {
    if ((idx < 0) || (idx >= this.marketsList.length)) {
      return;
    }
    const marketItem = this.marketsList[idx];

    this._manageService.joinAvailableMarket(marketItem.id).pipe(
      tap((isSuccess) => {
        if (isSuccess) {
          this._snackbar.open(TextContent.JOIN_MARKET_SUCCESS);
        }
      })
    ).subscribe(
      (isSuccess) => {
        if (isSuccess) {
          this._snackbar.open(TextContent.JOIN_MARKET_SUCCESS);
        }
      },
      (err) => {
        let msg = TextContent.JOIN_MARKET_ERROR_GENERIC;

        if (typeof err === 'string') {
          switch (err) {
            case 'You have already joined this Market.':
              msg = TextContent.JOIN_MARKET_ERROR_EXISTING;
              break;
            case 'Market has already been joined.':
              msg = TextContent.JOIN_MARKET_ERROR_PROFILE;
              break;
            case 'Could not create the market!':
            case 'SQLITE_CONSTRAINT: UNIQUE constraint failed: markets.name, markets.profile_id':
              msg = TextContent.JOIN_MARKET_ERROR_NAME;
              break;
          }
        }

        this._snackbar.open(msg, 'warn');
      }
    );
  }


  openMarketJoinModal() {
    this._dialog.open(JoinWithDetailsModalComponent);
  }


  private loadMarkets(): Observable<AvailableMarket[]> {
    return of({}).pipe(
      tap(() => {
        this.isLoading = true;
        this.displayedMarkets = [];
        this.marketsList = [];
        this._cdr.detectChanges();
      }),
      concatMap(() => this._manageService.searchAvailableMarkets().pipe(
        catchError(() => {
          this._snackbar.open(TextContent.LOAD_MARKETS_ERROR, 'warn');
          return of([] as AvailableMarket[]);
        }),
        tap(markets => {
          this.isLoading = false;
          this.marketsList = markets;
          this.renderFilteredControl.setValue(null);
        })
      ))
    );
  }


  private getFilteredItems(): Observable<number[]> {
    return defer(() => {
      const searchString: string = (this.searchControl.value || '').toLocaleLowerCase();
      const filterRegion: string = this.filterRegionControl.value;
      const filterType: string = this.filterTypeControl.value;

      const doTypeFilter = filterType.length > 0;
      const isStorefront = +filterType > 0;

      const idxList: number[] = [];

      this.marketsList.forEach((market, marketIdx) => {
        const addItem =
            market.name.toLocaleLowerCase().includes(searchString) &&
            (filterRegion ? filterRegion === market.region.value : true) &&
            (doTypeFilter ? isStorefront === (market.publishKey === null) : true);

        if (addItem) {
          idxList.push(marketIdx);
        }
      });

      return of(idxList);
    });
  }
}
