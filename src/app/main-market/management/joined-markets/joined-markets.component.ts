import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, merge, defer, of, iif } from 'rxjs';
import { catchError, tap, takeUntil, switchMap, startWith, debounceTime, distinctUntilChanged, take, concatMap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../management.service';
import { LeaveMarketConfirmationModalComponent } from './leave-market-modal/leave-market-modal.component';
import { CategoryEditorModalComponent } from './category-editor-modal/category-editor-modal.component';
import { JoinedMarket } from '../management.models';
import { MarketType } from 'app/main-market/shared/market.models';
import { GenericModalInfo } from './joined-markets.models';


enum TextContent {
  LOAD_MARKETS_ERROR = 'Error while attempting to load joined markets',
  COPIED_TO_CLIPBOARD = 'Copied to clipboard...',
  LEAVE_MARKET_ERROR_GENERIC = 'Error while attempting to leave the market',
  LEAVE_MARKET_ERROR_DEFAULT_MARKET = 'A default market cannot be removed',
}


interface FilterOption {
  label: string;
  value: string;
}


@Component({
  selector: 'market-joined-markets',
  templateUrl: './joined-markets.component.html',
  styleUrls: ['./joined-markets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinedMarketsComponent implements OnInit, OnDestroy {

  marketTypeOptions: typeof MarketType = MarketType;

  optionsFilterMarketType: FilterOption[] = [
    { label: 'All markets',       value: '' },
    { label: 'Community Markets', value: MarketType.MARKETPLACE },
    { label: 'Storefronts',       value: MarketType.STOREFRONT },
    { label: 'Storefronts (Admin)', value: MarketType.STOREFRONT_ADMIN }
  ];

  optionsFilterMarketRegion: FilterOption[];


  searchControl: FormControl = new FormControl('');
  filterTypeControl: FormControl = new FormControl('');
  filterRegionControl: FormControl = new FormControl('');

  isLoading: boolean = true;
  displayedMarkets: number[] = [];
  marketsList: JoinedMarket[] = [];


  private destroy$: Subject<void> = new Subject();
  private renderFilteredControl: FormControl = new FormControl();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
  ) {
    this.optionsFilterMarketRegion = this._manageService.getMarketRegions();
  }


  ngOnInit() {

    const load$ = this._manageService.searchJoinedMarkets().pipe(
      catchError(() => {
        this._snackbar.open(TextContent.LOAD_MARKETS_ERROR, 'warn');
        return of([] as JoinedMarket[]);
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

    this.renderFilteredControl.setValue(null);
  }


  actionCopiedToClipBoard(): void {
    this._snackbar.open(TextContent.COPIED_TO_CLIPBOARD);
  }

  actionLeaveMarket(idx: number) {

    if ((idx < 0) || (idx >= this.marketsList.length) || !this.marketsList[idx]) {
      return;
    }

    const market = this.marketsList[idx];

    const data: GenericModalInfo = {
      market
    };
    this._dialog.open(
      LeaveMarketConfirmationModalComponent,
      { data }
    ).afterClosed().pipe(
      take(1),
      concatMap((isConfirmed: boolean) => iif(
        () => !!isConfirmed,
        defer(() => this._manageService.leaveMarket(market.id))
      ))
    ).subscribe(
      () => {
        if (this.marketsList[idx] && this.marketsList[idx].id === market.id) {
          this.marketsList.splice(idx, 1);
          this.renderFilteredControl.setValue(null);
        }
      },
      err => {
        const msg: string = `${err}`.includes('cannot be removed') ?
          TextContent.LEAVE_MARKET_ERROR_DEFAULT_MARKET :
          TextContent.LEAVE_MARKET_ERROR_GENERIC;

        this._snackbar.open(msg, 'warn');
      }
    );
  }


  actionOpenCategoryEditorModal(idx: number): void {
    const market = this.marketsList[idx];

    const data: GenericModalInfo = {
      market
    };
    this._dialog.open(
      CategoryEditorModalComponent,
      { data }
    );
  }


  private getFilteredItems(): Observable<number[]> {
    return defer(() => {
      const searchString: string = (this.searchControl.value || '').toLocaleLowerCase();
      const filterRegion: string = this.filterRegionControl.value;
      const filterType: string = this.filterTypeControl.value;

      const idxList: number[] = [];

      this.marketsList.forEach((market, marketIdx) => {
        const addItem =
            market.name.toLocaleLowerCase().includes(searchString) &&
            (filterRegion ? filterRegion === market.region.value : true) &&
            (filterType ? market.marketType === filterType : true);

        if (addItem) {
          idxList.push(marketIdx);
        }
      });

      return of(idxList);
    });
  }
}
