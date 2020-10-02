import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, merge, defer, of, iif } from 'rxjs';
import { catchError, tap, takeUntil, switchMap, startWith, debounceTime, distinctUntilChanged, take, concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { MarketManagementService } from '../management.service';
import { LeaveMarketConfirmationModalComponent } from './leave-market-modal/leave-market-modal.component';
import { CategoryEditorModalComponent } from './category-editor-modal/category-editor-modal.component';
import { PromoteMarketConfirmationModalComponent } from './promote-market-modal/promote-market-modal.component';
import { JoinedMarket } from '../management.models';
import { MarketType } from 'app/main-market/shared/market.models';
import { GenericModalInfo } from './joined-markets.models';
import { getValueOrDefault } from 'app/main-market/shared/utils';
import { MarketState } from 'app/main-market/store/market.state';


enum TextContent {
  LOAD_MARKETS_ERROR = 'Error while attempting to load joined markets',
  COPIED_TO_CLIPBOARD = 'Copied to clipboard...',
  LEAVE_MARKET_ERROR_GENERIC = 'Error while attempting to leave the market',
  LEAVE_MARKET_ERROR_DEFAULT_MARKET = 'A default market cannot be removed',
  PROMOTION_SUCCESS = 'Successfully promoted the market!',
  PROMOTION_ERROR = 'Failed to promote the market'
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

  readonly listingsPagePath: string;
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
    private _route: ActivatedRoute,
    private _store: Store,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _unlocker: WalletEncryptionService
  ) {
    this.optionsFilterMarketRegion = this._manageService.getMarketRegions();

    // Build up path to listings page
    const target: string[] = [];
    const pathSegments = this._route.snapshot.pathFromRoot;
    for (const segment of pathSegments) {
      if (segment.url && (segment.url.length === 1) && segment.url[0].path) {
        target.push(segment.url[0].path);
      }
    }

    if (target.length > 0) {
      target.pop();
    }

    const parentUrl = `/${target.join('/')}`;
    this.listingsPagePath = `${parentUrl}/listings`;
  }


  ngOnInit() {

    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      concatMap((iden) => iif(
        () => iden && iden.id > 0,
        defer(() => this.loadMarkets()),
      )),
      takeUntil(this.destroy$)
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
        this.displayedMarkets = this.marketsList.length > 0 ? indexes : [];
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );

    merge(
      identityChange$,
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
    if ((idx < 0) || (idx >= this.marketsList.length) || !this.marketsList[idx]) {
      return;
    }

    const market = this.marketsList[idx];

    const data: GenericModalInfo = {
      market
    };
    this._dialog.open(
      CategoryEditorModalComponent,
      { data }
    );
  }


  actionOpenPromoteMarketModal(idx: number): void {
    if ((idx < 0) || (idx >= this.marketsList.length) || !this.marketsList[idx]) {
      return;
    }

    const openModal$ = defer(() => {
      const market = this.marketsList[idx];
      const data: GenericModalInfo = {
        market
      };

      const _dialog = this._dialog.open(
        PromoteMarketConfirmationModalComponent,
        { data }
      );

      return _dialog.afterClosed().pipe(
        concatMap((dialogResp) => iif(
          () => getValueOrDefault(dialogResp, 'number', 0) && (+dialogResp > 0),

          defer(() => this._unlocker.unlock({timeout: 10}).pipe(
            concatMap((isUnlocked) => iif(
              () => isUnlocked,

              defer(() => this._manageService.promoteMarket(market.id, dialogResp))
            ))
          ))
        ))
      );
    });

    this._unlocker.unlock({timeout: 90}).pipe(
      concatMap((isUnlocked: boolean) => iif(() => isUnlocked, openModal$))
    ).subscribe(
      (isSuccess) => {
        if (!isSuccess) {
          this._snackbar.open(TextContent.PROMOTION_ERROR, 'warn');
          return;
        }

        this._snackbar.open(TextContent.PROMOTION_SUCCESS);
        // TODO: add indication of "promotion" here
      },
      () => this._snackbar.open(TextContent.PROMOTION_ERROR, 'warn')
    );

  }


  actionVoteKeep(marketId: number) {

  }


  actionVoteRemove(marketId: number) {

  }


  private loadMarkets(): Observable<JoinedMarket[]> {
    return of({}).pipe(
      tap(() => {
        this.isLoading = true;
        this.displayedMarkets = [];
        this.marketsList = [];
        this._cdr.detectChanges();
      }),
      concatMap(() => this._manageService.searchJoinedMarkets().pipe(
        catchError(() => {
          this._snackbar.open(TextContent.LOAD_MARKETS_ERROR, 'warn');
          return of([] as JoinedMarket[]);
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
