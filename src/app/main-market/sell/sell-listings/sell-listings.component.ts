import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, of, merge, forkJoin, Observable, timer } from 'rxjs';
import { catchError, finalize, tap, startWith, debounceTime, distinctUntilChanged, takeUntil, switchMap, map } from 'rxjs/operators';

import { SellListingsService } from './sell-listings.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { DataService } from 'app/main-market/services/data/data.service';

import { ListingDetailModalComponent, ListingItemDetailInputs } from '../../shared/listing-detail-modal/listing-detail-modal.component';
import { SellListing } from './sell-listings.models';


enum TextContent {
  ERROR_LOADING = 'There was an error loading listings. Please try again shortly',
  ERROR_LOAD_DETAILS = 'Could not load listing details',
}

enum SortOrderValues {
  TITLE = 'title',
  CREATED = 'created',
  MARKET_KEY = 'marketKey'
}


enum FilterStatusValues {
  ALL = '',
  ACTIVE = 'active',
  EXPIRED = 'expired'
}


@Component({
  selector: 'market-sell-listings',
  templateUrl: './sell-listings.component.html',
  styleUrls: ['./sell-listings.component.scss'],
  providers: [SellListingsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellListingsComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  allListings: SellListing[] = [];
  displayedListingIdxs: number[] = [];

  marketList: {[marketKey: string]: string} = {};

  readonly sortCriteria: {title: string; value: SortOrderValues}[] = [
    {title: 'By Title', value: SortOrderValues.TITLE},
    {title: 'By Creation', value: SortOrderValues.CREATED},
    {title: 'By Market', value: SortOrderValues.MARKET_KEY}
  ];

  readonly filterStatusCriteria: {title: string; value: FilterStatusValues}[] = [
    {title: 'All', value: FilterStatusValues.ALL},
    {title: 'Active', value: FilterStatusValues.ACTIVE},
    {title: 'Expired', value: FilterStatusValues.EXPIRED},
  ];

  readonly publishedOnMarketCriteria: {name: string; key: string}[] = [
    {name: 'All Markets', key: ''}
  ];


  searchQuery: FormControl = new FormControl();
  sortOrder: FormControl = new FormControl();
  filterStatus: FormControl = new FormControl();
  filterMarket: FormControl = new FormControl();
  filterBaseTemplateId: FormControl = new FormControl();


  private destroy$: Subject<void> = new Subject();
  private timerExpirer$: Subject<void> = new Subject();
  private doFilterChange: FormControl = new FormControl();


  constructor(
    private _sellService: SellListingsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbar: SnackbarService,
    private _sharedService: DataService,
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {

    this.resetFilters();

    const initParams = this._route.snapshot.queryParams;

    if (+initParams['SellListingsBaseTemplateID'] > 0) {
      this.filterBaseTemplateId.setValue(+initParams['SellListingsBaseTemplateID']);
    }


    const init$ = forkJoin(
        this._sharedService.loadMarkets().pipe(
          tap(marketsList => {
            marketsList.forEach(market => {
              this.marketList[market.receiveAddress] = market.name;
            });

            const marketKeys = Object.keys(this.marketList);
            for (const key of marketKeys) {
              this.publishedOnMarketCriteria.push(
                {name: this.marketList[key], key: key}
              );
            }

            if (initParams['SellListingsMarketKey']) {
              this.filterMarket.setValue(initParams['SellListingsMarketKey']);
            }

          }),
          catchError(() => of([])),
        ),

        this._sellService.fetchAllListings().pipe(
        catchError(() => {
          this._snackbar.open(TextContent.ERROR_LOADING, 'warn');
          return of([]);
        }),
        tap((listings) => {
          this.allListings = listings;
          this.startTimer();
        }),
      )
    ).pipe(
      finalize(() => this.isLoading = false)
    );

    const search$ = this.searchQuery.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const sort$ = this.sortOrder.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const filterStatus$ = this.filterStatus.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const filterMarket$ = this.filterMarket.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const refreshRequest$ = merge(
      init$,
      search$,
      sort$,
      filterStatus$,
      filterMarket$,
    ).pipe(
      tap(() => {
        this.doFilterChange.setValue(true);
      }),
      takeUntil(this.destroy$)
    );

    const changeVisible$ = this.doFilterChange.valueChanges.pipe(
      debounceTime(100),
      switchMap(() => this.updateVisibleListings()),
      tap((displayIndexes) => {
        this.displayedListingIdxs = displayIndexes;
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );

    merge(
      refreshRequest$,
      changeVisible$
    ).subscribe();
  }


  ngOnDestroy() {
    this.timerExpirer$.next();
    this.timerExpirer$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  openPreview(listingId: number) {
    if (!(+listingId > 0)) {
      return;
    }

    this._sharedService.getListingDetailsForMarket(listingId, 0).subscribe(
      (listing) => {
        if (+listing.id > 0) {
          const dialogData: ListingItemDetailInputs = {
            listing,
            canChat: true,
            initTab: 'default',
            displayActions: {
              cart: false,
              governance: false,
              fav: false
            }
          };

          this._dialog.open(
            ListingDetailModalComponent,
            { data: dialogData }
          );

        } else {
          this._snackbar.open(TextContent.ERROR_LOAD_DETAILS, 'warn');
        }
      },

      (err) => this._snackbar.open(TextContent.ERROR_LOAD_DETAILS, 'warn')
    );
  }


  navigateToTemplate(baseTemplateId: number, marketKey: string) {
    const targetTabName = 'templates';

    this._router.navigate(['../'], {
      relativeTo: this._route,
      queryParams: {
        selectedSellTab: targetTabName,
        TemplatesBaseTemplateID: +baseTemplateId,
        TemplatesMarketKey: marketKey,
        refresh: Date.now()   // ensures that the route params are technically refreshed and updated
      }
    });
  }


  resetFilters() {
    this.searchQuery.setValue('');
    this.sortOrder.setValue('created');
    this.filterStatus.setValue('');
    this.filterMarket.setValue('');
    this.filterBaseTemplateId.setValue('');
  }


  private updateVisibleListings(): Observable<number[]> {

    if (this.allListings.length === 0) {
      return of([]);
    }

    const searchStr: string = this.searchQuery.value.toLowerCase();
    const filterStatus: string = this.filterStatus.value;
    const filterMarket: string = this.filterMarket.value;
    const sortOrder: string = this.sortOrder.value;
    const baseTemplateId: number = +this.filterBaseTemplateId.value;

    const now = Date.now();
    const foundIndexes: number[] = [];

    this.allListings.forEach((li: SellListing, idx: number) => {
      if (
        (baseTemplateId > 0 ? li.idBaseTemplate === baseTemplateId : true) &&
        (filterMarket === '' ? true : li.marketKey === filterMarket) &&
        (filterStatus === FilterStatusValues.ALL ? true : (filterStatus === FilterStatusValues.ACTIVE ? li.expires > now : false)) &&
        li.title.toLowerCase().includes(searchStr)
      ) {
        foundIndexes.push(idx);
      }
    });

    foundIndexes.sort((a, b) => {
      if (sortOrder === SortOrderValues.CREATED) {
        return this.allListings[a].created - this.allListings[b].created;
      }

      return this.allListings[a][sortOrder] > this.allListings[b][sortOrder] ? -1 : 1;
    });

    return of(foundIndexes);
  }


  private startTimer() {
    try {
      this.timerExpirer$.next();  // ensure that the timer has expired
    } catch (e) {
      return;
    }
    let timerCount = Number.MAX_SAFE_INTEGER;
    const now = Date.now() + 2000;    // add a little buffer

    this.allListings.forEach(li => {
      if (li.expires < now) {
        li.status = 'EXPIRED';
      } else if (li.expires < timerCount) {
        timerCount = li.expires;
      }
    });

    this._cdr.detectChanges();  // update the view for any expired listing status changes

    if ((timerCount < Number.MAX_SAFE_INTEGER) && !this.destroy$.closed) {
      timer((Date.now() + 1000) > timerCount ? 0 : (timerCount - Date.now())).pipe(
        takeUntil(this.timerExpirer$)
      ).subscribe(
        () => this.startTimer()
      );
    }
  }

}
