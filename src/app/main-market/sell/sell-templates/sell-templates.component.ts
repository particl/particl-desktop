import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, of, Observable, defer, forkJoin, merge, timer, iif, } from 'rxjs';
import { tap, catchError, takeUntil, switchMap, distinctUntilChanged, debounceTime, map, concatMap, take, finalize } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';

import { DataService } from '../../services/data/data.service';
import { SellService } from '../sell.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';

import { DeleteTemplateModalComponent } from '../modals/delete-template-modal/delete-template-modal.component';
import { BatchPublishModalComponent} from '../modals/batch-publish-modal/batch-publish-modal.component';
import { PublishTemplateModalComponent, PublishTemplateModalInputs } from '../modals/publish-template-modal/publish-template-modal.component';
import { ListingDetailModalComponent, ListingItemDetailInputs } from 'app/main-market/shared/listing-detail-modal/listing-detail-modal.component';
import { CloneTemplateModalInput, CloneTemplateModalComponent } from '../modals/clone-template-modal/clone-template-modal.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';

import { isBasicObjectType } from 'app/main-market/shared/utils';
import { Market } from '../../services/data/data.models';
import { ProductItem, TEMPLATE_STATUS_TYPE, ProductMarketTemplate } from '../sell.models';


enum TextContent {
  UNKNOWN_MARKET = '<unknown>',
  LOAD_ERROR = 'An error occurred loading products',
  PUBLISH_WAIT = 'Publishing the template to the selected market',
  CLONE_WAIT = 'Creating your new product details',
  ERROR_DELETE_PRODUCT = 'An error occurred while deleting the product!',
  ERROR_CLONE_ITEM = 'An error occurred during copying!',
  PUBLISH_FAILED = 'Failed to publish the template',
  PUBLISH_SUCCESS = 'Successfully created a listing!',
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
    private _unlocker: WalletEncryptionService,
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
        map((products) => products.map(p => this.createDisplayableProductItem(p))),
        catchError(() => {
          this._snackbar.open(TextContent.LOAD_ERROR, 'warn');
          return of([] as DisplayableProductItem[]);
        }),
        tap(products => {
          this.isLoading = false;
          this.allProducts = products;
          this.marketUpdateControl.setValue(null);
          this.resetMarketListingTimer();
        })
      )
    );

    const search$ = this.searchQuery.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const orderBy$ = this.sortOrder.valueChanges.pipe(
      takeUntil(this.destroy$)
    );


    const expiryReset$ = this.actionRefreshControl.valueChanges.pipe(
      tap(() => this.resetMarketListingTimer()),
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
      expiryReset$,
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


  actionCloneProduct(productId: number, marketTemplateId?: number): void {
    const foundProduct = this.allProducts.find(p => p.id === productId);
    if (!foundProduct) {
      return;
    }

    let title = foundProduct.title;
    const availableMarkets = [];

    if (+marketTemplateId > 0) {
      if (foundProduct.displayDetails.availableMarkets.length === 0) {
        return;
      }

      const foundmarketTempl = foundProduct.markets.find(m => m.id === +marketTemplateId);

      if (!foundmarketTempl) {
        return;
      }

      title = foundmarketTempl.title;

      foundProduct.displayDetails.availableMarkets.filter(
        mkey => this.profileMarkets[mkey]
      ).map(
        mkey => ({id: this.profileMarkets[mkey].identityId, name: this.profileMarkets[mkey].name})
      ).forEach(m => availableMarkets.push(m));
    }


    const modalData: CloneTemplateModalInput = {
      templateTitle: title,
      markets: availableMarkets
    };

    this._dialog.open(
      CloneTemplateModalComponent,
      {data: modalData}
    ).afterClosed().pipe(
      take(1),
      concatMap((confirmationData) => iif(
        () => isBasicObjectType(confirmationData),

        iif(
          () => confirmationData.isBaseClone,

          defer(() => {
            this._dialog.open(ProcessingModalComponent, {
              disableClose: true,
              data: { message: TextContent.CLONE_WAIT }
            });
            return this._sellService.cloneTemplateAsBaseProduct(productId);
          }),

          defer(() => iif(

            () => (+confirmationData.marketId > 0) && (+confirmationData.categoryId > 0),

            defer(() => {
              this._dialog.open(ProcessingModalComponent, {
                disableClose: true,
                data: { message: TextContent.CLONE_WAIT }
              });

              return this._sellService.cloneTemplateAsMarketTemplate(
                +marketTemplateId, +confirmationData.marketId, +confirmationData.categoryId
              );
            })

          ))

        ),
      )),

      finalize(() => this._dialog.closeAll())

    ).subscribe(
      (newItem: ProductItem | ProductMarketTemplate | null) => {
        if (newItem === null) {
          this._snackbar.open(TextContent.ERROR_CLONE_ITEM, 'warn');
          return;
        }

        if (!(+marketTemplateId > 0)) {
          this.allProducts.push(this.createDisplayableProductItem(newItem as ProductItem));
          this.marketUpdateControl.setValue(null);
        } else {
          foundProduct.displayDetails.availableMarkets = foundProduct.displayDetails.availableMarkets.filter(
            am => am !== (newItem as ProductMarketTemplate).marketKey
          );
          foundProduct.markets.push(newItem as ProductMarketTemplate);
        }

        this.actionRefreshControl.setValue(null);
      },

      () => this._snackbar.open(TextContent.ERROR_CLONE_ITEM, 'warn')
    );
  }


  openPublishExistingMarketModal(productId: number, marketTemplId: number): void {

    const foundProduct = this.allProducts.find(p => p.id === productId);

    if (!foundProduct) {
      return;
    }

    const marketTempl = foundProduct.markets.find(m => m.id === marketTemplId);

    if (!marketTempl) {
      return;
    }

    const openDialog$ = defer(() => {
      const modalData: PublishTemplateModalInputs = {
        templateID: marketTemplId,
        title: marketTempl.title,
        marketName: this.profileMarkets[marketTempl.marketKey] ? this.profileMarkets[marketTempl.marketKey].name : '',
        categoryName: marketTempl.categoryName
      };

      const dialog = this._dialog.open(
        PublishTemplateModalComponent,
        {data: modalData}
      );

      return dialog.afterClosed().pipe(
        take(1),
        concatMap((details: {duration: number} | null) => iif(
          () => isBasicObjectType(details) && (+details.duration > 0),

          defer(() => this._unlocker.unlock({timeout: 10}).pipe(
            concatMap((unlocked) => iif(

              () => unlocked,

              defer(() => {

                const loaderDialog = this._dialog.open(ProcessingModalComponent, {
                  disableClose: true,
                  data: { message: TextContent.PUBLISH_WAIT }
                });

                return this._sellService.publishMarketTemplate(marketTemplId, +details.duration).pipe(
                  catchError(() => of(false)),
                  tap((isSuccess) => {
                    loaderDialog.close();

                    if (isSuccess) {
                      this._snackbar.open(TextContent.PUBLISH_SUCCESS);
                      // fake the hash on the market template (if there isn't one already): we only care if a hash is set, not what it is
                      if (marketTempl.hash.length === 0) {
                        marketTempl.hash = 'abcdefg';
                      }
                      this.actionRefreshControl.setValue(null);
                    } else {
                      this._snackbar.open(TextContent.PUBLISH_FAILED, 'warn');
                    }
                  })
                );
              })
            ))
          ))
        ))
      );

    });

    this._unlocker.unlock({timeout: 30}).pipe(
      concatMap(isUnlocked => iif(() => isUnlocked, openDialog$))
    ).subscribe();
  }


  openPublishProductModal(productId: number): void {
    const foundProduct = this.allProducts.find(p => p.id === productId);

    if (!foundProduct || foundProduct.markets.length === foundProduct.displayDetails.availableMarkets.length) {
      return;
    }
  }


  openBatchPublishModal(): void {
    this._dialog.open(BatchPublishModalComponent, {
      disableClose: true
    });
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


  private createDisplayableProductItem(p: ProductItem): DisplayableProductItem {
    const dp: DisplayableProductItem = {
      ...p,
      displayDetails: {
        activeMarketCount: 0,
        availableMarkets: [],
        totalListings: p.markets.reduce((acc, market) => acc + market.listings.count, 0)
      }
    };
    return dp;
  }

}
