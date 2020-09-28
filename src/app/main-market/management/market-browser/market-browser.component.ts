import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, of, merge, Observable, defer } from 'rxjs';
import { catchError, tap, takeUntil, switchMap, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../management.service';
import { AvailableMarket } from '../management.models';


enum TextContent {
  LOAD_MARKETS_ERROR = 'Error while attempting to load available markets',
  COPIED_TO_CLIPBOARD = 'Copied to clipboard...'
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

  // optionsFilterMarketJoined: FilterOption[] = [
  //   { label: 'Joined & Available', value: '' },
  //   { label: 'Joined Markets only',     value: '1' },
  //   { label: 'Available Markets only',  value: '0' }
  // ];

  optionsFilterMarketType: FilterOption[] = [
    { label: 'All markets',       value: '' },
    { label: 'Community Markets', value: '0' },
    { label: 'Storefronts',       value: '1' }
  ];

  optionsFilterMarketRegion: FilterOption[];

  searchControl: FormControl = new FormControl('');
  filterTypeControl: FormControl = new FormControl('');
  filterRegionControl: FormControl = new FormControl('');
  // filterJoinedControl: FormControl = new FormControl('');

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
    const load$ = this._manageService.searchAvailableMarkets().pipe(
      catchError(() => {
        this._snackbar.open(TextContent.LOAD_MARKETS_ERROR, 'warn');
        return of([] as AvailableMarket[]);
      }),
      tap(markets => {
        this.isLoading = false;
        this.marketsList = markets;
        this.renderFilteredControl.setValue(null);
      })
    );


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
        this.displayedMarkets = indexes;
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );


    merge(
      load$,
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
    // this.filterJoinedControl.setValue('', {emitEvent: false});

    this.renderFilteredControl.setValue(null);
  }


  actionJoinMarket(market: AvailableMarket): void {
    // TODO: implement this
  }


  actionCopiedToClipBoard(): void {
    this._snackbar.open(TextContent.COPIED_TO_CLIPBOARD);
  }


  openMarketJoinModal() {
    // TODO: implement this
  }


  private getFilteredItems(): Observable<number[]> {
    return defer(() => {
      const searchString: string = (this.searchControl.value || '').toLocaleLowerCase();
      // const filterJoined: string = this.filterJoinedControl.value;
      const filterRegion: string = this.filterRegionControl.value;
      const filterType: string = this.filterTypeControl.value;

      // const doJoinedFilter = filterJoined.length > 0;
      // const isJoined = +filterJoined > 0;

      const doTypeFilter = filterType.length > 0;
      const isStorefront = +filterType > 0;

      const idxList: number[] = [];

      this.marketsList.forEach((market, marketIdx) => {
        const addItem =
            market.name.toLocaleLowerCase().includes(searchString) &&
            // (doJoinedFilter ? market.isJoined === isJoined : true) &&
            (filterRegion ? filterRegion === market.region : true) &&
            (doTypeFilter ? isStorefront === (market.publishKey === null) : true);

        if (addItem) {
          idxList.push(marketIdx);
        }
      });

      return of(idxList);
    });
  }
}
