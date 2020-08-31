import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, of, Observable, defer, forkJoin, merge, timer, iif, } from 'rxjs';
import { tap, catchError, finalize, takeUntil, switchMap, distinctUntilChanged, debounceTime, map, concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';

import { DataService } from '../../services/data/data.service';
import { SellService } from '../sell.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';

import { DeleteTemplateModalComponent } from '../modals/delete-template-modal/delete-template-modal.component';
import { ListingDetailModalComponent, ListingItemDetailInputs } from 'app/main-market/shared/listing-detail-modal/listing-detail-modal.component';

import { Market } from '../../services/data/data.models';
import { ProductItem, TEMPLATE_STATUS_TYPE } from '../sell.models';


enum TextContent {
  UNKNOWN_MARKET = '<unknown>',
  LOAD_ERROR = 'An error occurred loading products',
  ERROR_DELETE_PRODUCT = 'An error occurred while deleting the product!'
}


interface DisplayableProductItem extends ProductItem {
  displayDetails: {
    activeMarketCount: number;
    totalListings: number;
    availableMarkets: string[];
  };
}


@Component({
  selector: 'market-sell-templates',
  templateUrl: './sell-templates.component.html',
  styleUrls: ['./sell-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellTemplatesComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;

  displayedProductIdxs: number[] = [];
  allProducts: DisplayableProductItem[] = [];

  profileMarkets: {[key: string]: {name: string; identityId: number} } = {};
  activeIdentityMarkets: string[] = [];

  readonly sortCriteria: {title: string; value: string}[] = [
    {title: 'By Title', value: 'title'},
    {title: 'By Creation', value: 'created'},
    {title: 'By Updated', value: 'updated'}
  ];

  searchQuery: FormControl = new FormControl('');
  sortOrder: FormControl = new FormControl('updated');


  private destroy$: Subject<void> = new Subject();
  private timerTick$: Subject<void> = new Subject();
  private marketUpdateControl: FormControl = new FormControl();
  private actionRefreshControl: FormControl = new FormControl();
  private activeIdentityId: number = 0;


  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _sellService: SellService,
    private _sharedService: DataService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }


  ngOnInit() {

    const walletChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap(identity => {
        this.activeIdentityId = identity.id;
        this.marketUpdateControl.setValue(null);
      }),
      takeUntil(this.destroy$)
    );

    const init$ = forkJoin(
      this._sharedService.loadMarkets().pipe(
        tap(marketsList => {
          marketsList.forEach(market => {
            this.profileMarkets[market.receiveAddress] = {name: market.name, identityId: market.identityId};
          });
        }),
        catchError(() => of([] as Market[])),
      ),

      this._sellService.fetchAllProductTemplates().pipe(
        map((products) => {
          return products.map(p => {
            const dp: DisplayableProductItem = {
              ...p,
              displayDetails: {
                activeMarketCount: 0,
                availableMarkets: [],
                totalListings: p.markets.reduce((acc, market) => acc + market.listings.count, 0)
              }
            };
            return dp;
          });
        }),
        catchError(() => {
          this._snackbar.open(TextContent.LOAD_ERROR, 'warn');
          return of([] as DisplayableProductItem[]);
        }),
        tap(products => {
          this.allProducts = products;
          this.marketUpdateControl.setValue(null);
          this.resetMarketListingTimer();
        })
      )
    ).pipe(
      finalize(() => this.isLoading = false)
    );

    const search$ = this.searchQuery.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const orderBy$ = this.sortOrder.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    const productDisplay$ = merge(
      init$,
      search$,
      orderBy$,
      this.actionRefreshControl.valueChanges.pipe(takeUntil(this.destroy$))
    ).pipe(
      switchMap(() => this.updateProductDisplay()),
      tap((displayIndexes) => {
        this.displayedProductIdxs = displayIndexes;
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );


    const marketChange$ = this.marketUpdateControl.valueChanges.pipe(
      switchMap(() => this.calculateIdentityMarkets()),
      tap((identityMarkets) => {
        this.activeIdentityMarkets = identityMarkets;

        this.allProducts.forEach(p => {
          const productMarkets = p.markets.map(m => m.marketKey);
          p.displayDetails.availableMarkets = identityMarkets.filter(idmk => !productMarkets.includes(idmk));
        });

        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );


    merge(
      walletChange$,
      productDisplay$,
      marketChange$
    ).subscribe();
  }


  ngOnDestroy() {
    this.timerTick$.next();
    this.timerTick$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionDeleteProduct(productId: number): void {
    const foundProductIdx = this.allProducts.findIndex(p => p.id === productId);
    if ((foundProductIdx < 0) || (this.allProducts[foundProductIdx].markets.length > 0)) {
      return;
    }

    this._dialog.open(DeleteTemplateModalComponent).afterClosed().pipe(
      concatMap((isConfirmed: boolean | undefined) => iif(
        () => isConfirmed,
        defer(() => this._sellService.deleteTemplate(productId))
      ))
    ).subscribe(
      (success) => {
        if (!success) {
          this._snackbar.open(TextContent.ERROR_DELETE_PRODUCT, 'warn');
          return;
        }

        this.allProducts.splice(foundProductIdx, 1);
        this.actionRefreshControl.setValue(null);
      }
    );
  }


  actionCloneProduct(itemId: number, isMarketClone: boolean = false): void {

  }


  openPublishExistingMarketModal(marketTemplId: number): void {

  }


  openPublishProductModal(productId: number): void {

  }


  openPreviewListingModal(templateId: number): void {
    this._sellService.createListingPreviewFromTemplate(templateId).subscribe(
      (listing) => {
        if (+listing.id > 0) {
          const data: ListingItemDetailInputs = {
            listing,
            canChat: false,
            initTab: 'default',
            displayActions: {
              cart: false,
              governance: false,
              fav: false
            }
          };
          this._dialog.open(
            ListingDetailModalComponent,
            { data }
          );
        }
      }
    );
  }


  private updateProductDisplay(): Observable<number[]> {
    return defer(() => {
      const searchString = this.searchQuery.value.toLowerCase();
      const sortBy = this.sortOrder.value;

      const indexes = this.allProducts.map(
        (templ, idx) => templ.title.toLowerCase().includes(searchString) ? idx : -1
      ).filter(
        idx => (idx > -1)
      ).sort(
        (a, b) =>
        typeof this.allProducts[b][sortBy] === 'string'
          ? (this.allProducts[a][sortBy].toLocaleLowerCase() < this.allProducts[b][sortBy].toLocaleLowerCase() ? -1 : 1)
          : (this.allProducts[b][sortBy] - this.allProducts[a][sortBy])
      );

      return of(indexes);
    });
  }


  private calculateIdentityMarkets(): Observable<string[]> {
    return defer(() => {
      const id = this.activeIdentityId;
      return of(Object.keys(this.profileMarkets).filter(mKey => this.profileMarkets[mKey].identityId === id));
    });
  }


  private resetMarketListingTimer() {
    this.timerTick$.next();  // end any current running timer

    let soonest = Number.MAX_SAFE_INTEGER;
    const now = Date.now();

    this.allProducts.forEach(p => {
      let activeCount = 0;
      p.markets.forEach(m => {
        if (m.listings.latestExpiry > now && m.listings.latestExpiry < soonest) {
          soonest = m.listings.latestExpiry;
        }
        m.status = this._sellService.calculateMarketTemplateStatus(m);
        if ((m.status === TEMPLATE_STATUS_TYPE.ACTIVE) || (m.status === TEMPLATE_STATUS_TYPE.PENDING)) {
          activeCount += 1;
        }
      });

      p.displayDetails.activeMarketCount = activeCount;
    });

    this._cdr.detectChanges();  // update the view to render any changes

    if ((soonest < Number.MAX_SAFE_INTEGER) && !this.timerTick$.closed) {
      // start the timer
      timer((Date.now() + 500) > soonest ? 0 : (soonest - Date.now())).pipe(
        takeUntil(this.timerTick$)
      ).subscribe(
        () => this.resetMarketListingTimer()
      );
    }

  }

}
