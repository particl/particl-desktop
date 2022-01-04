import { PartoshiAmount } from 'app/core/util/utils';
import { Component, OnInit, OnDestroy, Inject, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject, BehaviorSubject, merge, of, iif, defer, combineLatest } from 'rxjs';
import { tap, takeUntil, distinctUntilChanged, switchMap, catchError, map, concatMap, startWith } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { WalletBalanceState } from 'app/main/store/main.state';

import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { DataService } from '../../../services/data/data.service';
import { SellService } from '../../sell.service';
import { TreeSelectComponent } from '../../../shared/shared.module';
import { isBasicObjectType } from '../../../shared/utils';
import { PublishDurations, BatchPublishProductItem } from '../../sell.models';
import { MarketType } from '../../../shared/market.models';


function productCategorySelectedValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!!(control as FormArray).controls[0].value) {
      if (!(+(control as FormArray).controls[1].value > 0)) {
        return {'productCategorySelected': true};
      }
    }
    return null;
  };
}

function productPricingValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (
      (+(control as FormArray).controls[2].value >= 0)
      && (+(control as FormArray).controls[3].value >= 0)
      && (+(control as FormArray).controls[4].value >= 0)
      && (+(control as FormArray).controls[2].value + +(control as FormArray).controls[3].value > 0.0001)
      && (+(control as FormArray).controls[2].value + +(control as FormArray).controls[4].value > 0.0001)
    ) {
      return null;
    }
    return {'productPricing': true};
  };
}


function minProductsSelectedValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    return (control as FormArray).controls.find(c => !!(c as FormArray).controls[0].value) === undefined ?
        { minProductsSelected: true } : null;
  };
}


export interface BatchPublishModalInputs {
  markets: {id: number; name: string, key: string, marketType: MarketType, image: string}[];
  products: BatchPublishProductItem[];
}


interface ReferenceBatchPublishProductItem extends BatchPublishProductItem {
  currentPriceBase: string;
  currentPriceShippingLocal: string;
  currentPriceShippingIntl: string;
}


enum PriceChangeOptions {
  NO_UPDATE = 'n',
  PERCENTAGE = 'p',
}


enum TextContent {
  PUBLISH_ERROR_GENERIC = 'Publishing failed, please try again',
  PUBLISH_ERROR_INVALID_TEMPLATE = 'Publishing error: Invalid product template',
  PUBLISH_ERROR_BLACKLISTED_MARKET = 'Publishing error: Market blacklisted',
}


@Component({
  templateUrl: './batch-publish-modal.component.html',
  styleUrls: ['./batch-publish-modal.component.scss']
})
export class BatchPublishModalComponent implements OnInit, OnDestroy {

  PriceChangeOptions: typeof PriceChangeOptions = PriceChangeOptions; // so we can use it in HTML

  readonly availableMarkets: Array<{id: number; name: string, key: string, marketType: MarketType, image: string}> = [];
  readonly availableProducts: ReferenceBatchPublishProductItem[] = [];
  readonly categories$: Observable<{id: number, name: string}[]>;

  readonly publishDurations: Array<{title: string; value: number}> = PublishDurations;
  readonly productPresets: Array<{title: string; value: string}> = [
    { title: 'Select all', value: 'all' },
    // { title: 'Unpublished', value: 'unpublished' },
    // { title: 'Expired', value: 'expired' },
    { title: 'Deselect all', value: 'none' }
  ];

  readonly productPriceChangeOptions: Array<{ label: string, value: PriceChangeOptions }> = [
    { label: 'Specify exact price', value: PriceChangeOptions.NO_UPDATE },
    { label: 'Update by percentage', value: PriceChangeOptions.PERCENTAGE },
  ];

  presetControl: FormControl = new FormControl('');

  currentIdentity: { name: string; image: string; } = {
    name: '',
    image: ''
  };

  currentBalance: number = 0;

  publishingInfo: {successProducts: number[], progressPercent: number} = {
    successProducts: [],
    progressPercent: 0
  };

  readonly specificErrorMessages: Map<number, string> = new Map();
  readonly batchPublishForm: FormGroup;
  readonly isProcessingControl: FormControl = new FormControl(false);


  private destroy$: Subject<void> = new Subject();
  private categoryList$: BehaviorSubject<{id: number; name: string}[]> = new BehaviorSubject([]);
  private didModifySomething: boolean = false;
  @ViewChildren('categorySelector') private categorySelectorChildren: QueryList<TreeSelectComponent>;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: BatchPublishModalInputs,
    private _dialogRef: MatDialogRef<BatchPublishModalComponent>,
    private _store: Store,
    private _sellService: SellService,
    private _sharedService: DataService,
    private _unlocker: WalletEncryptionService,
  ) {

    this.categories$ = this.categoryList$.asObservable();

    this.batchPublishForm = new FormGroup({
      selectedMarket: new FormControl('', [Validators.required]),
      selectedDuration: new FormControl('', [Validators.required]),
      pricePercentageChange: new FormControl(100, [Validators.required, Validators.min(0.1), Validators.max(1000)]),
      priceChangeShipping: new FormControl(true),
      /**
       * availableProducts control is:
       *    FormArray[
       *      selectedForPublish: boolean,
       *      categoryId: number,
       *      newPriceBase: number,
       *      newPriceShipLocal: number,
       *      newPriceShipIntl: number,
       *      selected price change option: PriceChangeOptions,
       *    ]
       **/
      availableProducts: new FormArray([], minProductsSelectedValidator())
    });

    if (isBasicObjectType(this.data)) {
      if (Array.isArray(this.data.markets)) {
        this.data.markets.forEach(m => {
          if (isBasicObjectType(m) && (typeof m.id === 'number') && (typeof m.name === 'string') && (typeof m.key === 'string')) {
            this.availableMarkets.push(m);
          }
        });
      }

      if (Array.isArray(this.data.products)) {
        this.data.products.forEach(prod => {
          if (
            isBasicObjectType(prod) &&
            (typeof prod.id === 'number') &&
            (typeof prod.name === 'string') &&
            (typeof prod.image === 'string') &&
            Array.isArray(prod.existingMarkets)
          ) {
            this.availableProducts.push({...prod, currentPriceBase: '', currentPriceShippingLocal: '', currentPriceShippingIntl: ''});

            const newArray = new FormArray(
              [
                new FormControl(false),
                new FormControl(0),
                new FormControl(+prod.priceBase, [Validators.required, Validators.min(0)]),
                new FormControl(+prod.priceShippingLocal, [Validators.required, Validators.min(0)]),
                new FormControl(+prod.priceShippingIntl, [Validators.required, Validators.min(0)]),
                new FormControl(PriceChangeOptions.PERCENTAGE),
              ],
              [
                productCategorySelectedValidator(),
                productPricingValidator()
              ]
            );
            (this.batchPublishForm.get('availableProducts') as FormArray).push(newArray);
          }
        });
      }
    }
  }


  ngOnInit() {

    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((identity) => {
        this.currentIdentity.name = identity.displayName;
        this.currentIdentity.image = identity.displayName[0].toLocaleUpperCase();
      }),
      takeUntil(this.destroy$)
    );


    const balanceChange$ = this._store.select(MarketState.settings).pipe(
      switchMap((settings) => iif(
        () => settings.useAnonBalanceForFees,

        defer(() => this._store.select(WalletBalanceState.spendableAmountAnon()).pipe(takeUntil(this.destroy$))),
        defer(() => this._store.select(WalletBalanceState.spendableAmountPublic()).pipe(takeUntil(this.destroy$))),
      )),
      map(value => +value),
      tap((balance) => this.currentBalance = balance),
      takeUntil(this.destroy$),
    );


    const marketChange$ = this.batchPublishForm.get('selectedMarket').valueChanges.pipe(
      startWith(0),
      distinctUntilChanged(),

      tap(() => this.categoryList$.next([])),

      tap((marketId) => {
        if (marketId <= 0) {
          this.presetControl.disable();
          (this.formAvailableProducts.controls.forEach((c) => (c as FormArray).at(0).setValue(false)));
        } else {
          if (this.presetControl.disabled) {
            this.presetControl.enable();
          }
        }
      }),

      map((marketId: any) => {
        // To get the complete list of MARKETPLACE market categories we should NOT pass in a market id to the category search
        let searchedMId: number = undefined;
        const market = this.availableMarkets.find(m => m.id === +marketId);

        if ((market !== undefined) && (market.marketType !== MarketType.MARKETPLACE)) {
          searchedMId = +marketId;
        }
        return searchedMId;
      }),

      // fetch categories for the selected market
      switchMap((marketId) => this._sharedService.loadCategories(+marketId).pipe(
        map(categories => categories.categories),
        catchError(() => of([])))
      ),

      // load the categories into the tree-select for each selector
      tap(categories => this.categoryList$.next(categories)),

      tap(() => {
        const marketId = this.batchPublishForm.get('selectedMarket').value;
        const refs = this.categorySelectorChildren.toArray();

        if (marketId > 0) {
          this.availableProducts.forEach((prod, idx) => {
            const existingMarket = prod.existingMarkets.find(m => m.marketId === marketId);

            // reset each tree-select (and the equivalent form control value) to any existing market category selection
            refs[idx].resetSelection(existingMarket && (existingMarket.categoryId > 0) ? existingMarket.categoryId : null);
            (this.formAvailableProducts.controls[idx] as FormArray).at(1).setValue(existingMarket ? existingMarket.categoryId : 0);

            // update current price and new price for each product for the market selected
            prod.currentPriceBase = existingMarket ? existingMarket.priceBase : prod.priceBase;
            prod.currentPriceShippingLocal = existingMarket ? existingMarket.priceShippingLocal : prod.priceShippingLocal;
            prod.currentPriceShippingIntl = existingMarket ? existingMarket.priceShippingIntl : prod.priceShippingIntl;

            this.setProductPricingStatus(idx, (<FormArray>this.formAvailableProducts.controls[idx]).at(5).value, false);
          });
        }
      }),

      takeUntil(this.destroy$)
    );


    const globalPercentageUpdates$ = combineLatest([
      this.batchPublishForm.get('pricePercentageChange').valueChanges.pipe(
        startWith(+this.batchPublishForm.get('pricePercentageChange').value),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this.batchPublishForm.get('priceChangeShipping').valueChanges.pipe(
        startWith(this.batchPublishForm.get('priceChangeShipping').value),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),
    ]).pipe(
      tap(changes => {
        const pricePercentage = +changes[0];
        const doShipping = changes[1];

        if (this.batchPublishForm.get('pricePercentageChange').invalid) {
          return;
        }

        const productControls = this.formAvailableProducts.controls;
        // have to update all of the products: not a great solution (is anything in this component great?!), but a working one for now...
        this.availableProducts.forEach((product, productIndex) => {
          if ((<FormArray>productControls[productIndex]).at(5).value === PriceChangeOptions.PERCENTAGE) {
            this.adjustControlPercentPrice(productIndex, pricePercentage, doShipping);
          }
        });
      })
    );


    const preselectChange$ = this.presetControl.valueChanges.pipe(
      tap((presetValue: string) => {
        if (presetValue === '') {
          return;
        }
        this.formAvailableProducts.controls.forEach(c => {
          (c as FormArray).at(0).setValue(presetValue === 'all');
        });

        this.presetControl.setValue('');
      }),
      takeUntil(this.destroy$)
    );


    const process$ = this.isProcessingControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap((isProcessing: boolean) => {
        if (isProcessing) {
          this.batchPublishForm.disable();
          this.presetControl.disable();
          this.publishingInfo.progressPercent = 0;
          this.publishingInfo.successProducts = [];
          this.specificErrorMessages.clear();
        } else {
          this.batchPublishForm.enable();
          this.presetControl.enable();
        }
      }),
      concatMap((isProcessing: boolean) => {
        const countProducts = this.formAvailableProducts.controls.filter(c => !!(c as FormArray).at(0).value).length;

        return iif(
          () => isProcessing,

          defer(() => this._unlocker.unlock({timeout: countProducts * 10}).pipe(
            concatMap((isUnlocked) => iif(
              () => isUnlocked,
              defer(() => this.publishProducts()),
              defer(() => this.isProcessingControl.setValue(false))
            ))
          ))
        );
      }),
      takeUntil(this.destroy$)
    );


    merge(
      identityChange$,
      balanceChange$,
      marketChange$,
      globalPercentageUpdates$,
      preselectChange$,
      process$
    ).subscribe();

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get formAvailableProducts(): FormArray {
    return this.batchPublishForm.get('availableProducts') as FormArray;
  }


  setProductCategory(productIdx: number, categoryId: number): void {
    (this.formAvailableProducts.at(productIdx) as FormArray).at(1).setValue(+categoryId > 0 ? +categoryId : 0);
  }


  isSelectedForPublish(productIdx: number): boolean {
    return !!(this.formAvailableProducts.at(productIdx) as FormArray).at(0).value;
  }

  setProductPricingStatus(controlIndex: number, option: PriceChangeOptions, forceNoUpdateSelectionToReset: boolean = true) {

    if (!((+controlIndex >= 0) && (+controlIndex < this.formAvailableProducts.length))) {
      return;
    }

    switch (option) {
      case PriceChangeOptions.NO_UPDATE:
        if (forceNoUpdateSelectionToReset) {
          this.adjustControlPercentPrice(controlIndex, 100, true);
        }
        break;
      case PriceChangeOptions.PERCENTAGE:
        this.adjustControlPercentPrice(
          controlIndex,
          +this.batchPublishForm.get('pricePercentageChange').value,
          this.batchPublishForm.get('priceChangeShipping').value
        );
        break;
    }
  }


  actionCloseModal() {
    this._dialogRef.close(this.didModifySomething);
  }


  actionBatchPublish() {
    if (this.batchPublishForm.disabled) {
      return;
    }

    this.isProcessingControl.setValue(true);
  }


  private adjustControlPercentPrice(ctrlIdx: number, percentage: number, includeShippingChanges: boolean) {
    const productControl = (<FormArray>this.formAvailableProducts.controls[ctrlIdx]);

    const sourceProductInfo = this.availableProducts[ctrlIdx];
    const calcPercent = percentage / 100;
    productControl.at(2).setValue(new PartoshiAmount(+sourceProductInfo.currentPriceBase, false).multiply(calcPercent).particls());

    if (includeShippingChanges) {
      productControl.at(3).setValue(
        new PartoshiAmount(+sourceProductInfo.currentPriceShippingLocal, false).multiply(calcPercent).particls()
      );
      productControl.at(4).setValue(
        new PartoshiAmount(+sourceProductInfo.currentPriceShippingIntl, false).multiply(calcPercent).particls()
      );
    } else {
      productControl.at(3).setValue(+sourceProductInfo.currentPriceShippingLocal);
      productControl.at(4).setValue(+sourceProductInfo.currentPriceShippingIntl);
    }
  }


  private async publishProducts(): Promise<void> {
    const selectedMarketId = +this.batchPublishForm.get('selectedMarket').value;
    const selectedMarket = this.availableMarkets.find(m => m.id === selectedMarketId);

    if (!selectedMarket) {
      this.isProcessingControl.setValue(false);
      return;
    }

    const selectedDuration = +this.batchPublishForm.get('selectedDuration').value;
    const productsToProcess: [number, number, number, number, number, number, number][] = [];

    const productControls = this.formAvailableProducts.controls;

    this.availableProducts.forEach((product, productIndex) => {
      if (!!(productControls[productIndex] as FormArray).at(0).value) {
        productsToProcess.push([
          productIndex,  // for ease of reference later
          product.id,
          +(productControls[productIndex] as FormArray).at(1).value,
          +(productControls[productIndex] as FormArray).at(2).value,
          +(productControls[productIndex] as FormArray).at(3).value,
          +(productControls[productIndex] as FormArray).at(4).value,
          selectedDuration
        ]);
      }
    });

    const percentItemComplete = 1 / productsToProcess.length * 90;
    const percentItemStart = 1 / productsToProcess.length * 10;

    for (let ii = 0; ii < productsToProcess.length; ii++) {
      this.publishingInfo.progressPercent += percentItemStart;

      const detailsToPublish = productsToProcess[ii];
      const productIndex = detailsToPublish[0];
      const productId = detailsToPublish[1];
      const categoryId = detailsToPublish[2];
      const priceBase = detailsToPublish[3];
      const priceShipLocal = detailsToPublish[4];
      const priceShipIntl = detailsToPublish[5];
      const duration = detailsToPublish[6];

      await this._sellService.batchPublishProductToMarket(
        productId,
        {id: selectedMarketId, key: selectedMarket.key},
        categoryId,
        priceBase,
        priceShipLocal,
        priceShipIntl,
        duration
      ).then(
        () => {
          this.didModifySomething = true;
          // Update the product with the current selected market/category values (avoids needing a complicated data "refresh")

          const foundMarket = this.availableProducts[productIndex].existingMarkets.find(m => m.marketId === selectedMarketId);

          if (foundMarket) {
            foundMarket.categoryId = categoryId;
            foundMarket.priceBase = `${priceBase}`;
            foundMarket.priceShippingLocal = `${priceShipLocal}`;
            foundMarket.priceShippingIntl = `${priceShipIntl}`;
          } else {
            this.availableProducts[productIndex].existingMarkets.push({
              categoryId,
              marketId: selectedMarketId,
              priceBase: `${priceBase}`,
              priceShippingLocal: `${priceShipLocal}`,
              priceShippingIntl: `${priceShipIntl}`,
            });
          }

          this.availableProducts[productIndex].currentPriceBase = `${priceBase}`;
          this.availableProducts[productIndex].currentPriceShippingLocal = `${priceShipLocal}`;
          this.availableProducts[productIndex].currentPriceShippingIntl = `${priceShipIntl}`;

          // Let the template "know" that the publish was successful for this product
          this.publishingInfo.successProducts.push(productIndex);

          // Uncheck the product from being selected
          (this.formAvailableProducts.controls[productIndex] as FormArray).at(0).setValue(false);
          // explicitly set this to prevent further adjustments to the global percentage,
          //    which may re-update the price after the publish already succeeded
          (<FormArray>this.formAvailableProducts.controls[productIndex]).at(5).setValue(PriceChangeOptions.NO_UPDATE);
        }
      ).catch((err) => {
        let errMsg = TextContent.PUBLISH_ERROR_GENERIC;
        if (typeof err === 'string') {
          switch (true) {
            case err.startsWith('Invalid '): errMsg = TextContent.PUBLISH_ERROR_INVALID_TEMPLATE; break;
            case err.includes('Blacklisted recipient'): errMsg = TextContent.PUBLISH_ERROR_BLACKLISTED_MARKET; break;
          }
        }
        // Let the template "know" that the publish failed for this product
        this.specificErrorMessages.set(productIndex, errMsg);
      }).then(() => {
        // Cleanup the form control for this product
        this.formAvailableProducts.controls[productIndex].markAsPristine({onlySelf: true});
      });

      this.publishingInfo.progressPercent += percentItemComplete;
    }

    this.publishingInfo.progressPercent = 100;
    this.isProcessingControl.setValue(false);
  }

}
