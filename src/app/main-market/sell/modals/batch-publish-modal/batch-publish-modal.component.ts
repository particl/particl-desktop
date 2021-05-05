import { Component, OnInit, OnDestroy, Inject, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject, BehaviorSubject, merge, of, iif, defer, combineLatest } from 'rxjs';
import { tap, takeUntil, distinctUntilChanged, switchMap, catchError, map, concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { WalletUTXOState } from 'app/main/store/main.state';

import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { DataService } from '../../../services/data/data.service';
import { SellService } from '../../sell.service';
import { TreeSelectComponent } from '../../../shared/shared.module';
import { PartoshiAmount } from 'app/core/util/utils';
import { isBasicObjectType } from '../../../shared/utils';
import { WalletUTXOStateModel, PublicUTXO, AnonUTXO } from 'app/main/store/main.models';
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


function minProductsSelectedValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    return (control as FormArray).controls.find(c => !!(c as FormArray).controls[0].value) === undefined ?
        { minProductsSelected: true } : null;
  };
}


export interface BatchPublishModalInputs {
  markets: {id: number; name: string, key: string, marketType: MarketType}[];
  products: BatchPublishProductItem[];
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

  readonly availableMarkets: Array<{id: number; name: string, key: string, marketType: MarketType}> = [];
  readonly availableProducts: BatchPublishProductItem[] = [];
  readonly categories$: Observable<{id: number, name: string}[]>;

  readonly publishDurations: Array<{title: string; value: number}> = PublishDurations;
  readonly productPresets: Array<{title: string; value: string}> = [
    { title: 'Select all', value: 'all' },
    // { title: 'Unpublished', value: 'unpublished' },
    // { title: 'Expired', value: 'expired' },
    { title: 'Deselect all', value: 'none' }
  ];

  currentIdentity: { name: string; image: string; } = {
    name: '',
    image: ''
  };

  currentBalance: number = 0;

  publishingInfo: {successProducts: number[], progressPercent: number} = {
    successProducts: [],
    // failedProducts: [],
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
      presetControl: new FormControl(''),
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
            this.availableProducts.push(prod);

            const newArray = new FormArray([new FormControl(false), new FormControl(0)], productCategorySelectedValidator());
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

    const balanceChange$ = combineLatest([
      this._store.select(WalletUTXOState).pipe(takeUntil(this.destroy$)),
      this._store.select(MarketState.settings).pipe(takeUntil(this.destroy$))
    ]).pipe(
      map((values) => {
        const utxosSet: WalletUTXOStateModel = values[0];
        const settings = values[1];
        return this.extractSpendableBalance(settings.useAnonBalanceForFees ? utxosSet.anon : utxosSet.public);
      }),
      tap((balance) => this.currentBalance = balance),
      takeUntil(this.destroy$)
    );

    const marketChange$ = this.batchPublishForm.get('selectedMarket').valueChanges.pipe(
      distinctUntilChanged(),

      tap(() => this.categoryList$.next([])),

      tap((marketId) => {
        const presetControl = this.batchPublishForm.get('presetControl');
        if (marketId <= 0) {
          presetControl.disable();
          (this.formAvailableProducts.controls.forEach(c => (c as FormArray).at(0).setValue(false)));
        } else {
          if (presetControl.disabled) {
            presetControl.enable();
          }
        }
      }),

      map((marketId: any) => {
        // To get the complete list of MARKETPLACE market categories we should NOT pass in a market id to the category serach
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

      // reset each tree-select (and the equivalent form control value) to any existing market category selcetion
      tap(() => {
        const marketId = this.batchPublishForm.get('selectedMarket').value;
        const refs = this.categorySelectorChildren.toArray();

        this.availableProducts.forEach((prod, idx) => {
          const existingMarket = prod.existingMarkets.find(m => m.marketId === marketId);
          if (existingMarket && existingMarket.categoryId > 0) {
            refs[idx].resetSelection(existingMarket.categoryId);
            (this.formAvailableProducts.controls[idx] as FormArray).at(1).setValue(existingMarket.categoryId);
          }
        });
      }),

      takeUntil(this.destroy$)
    );

    const preselectChange$ = this.batchPublishForm.get('presetControl').valueChanges.pipe(
      tap((presetValue: string) => {
        if (presetValue === '') {
          return;
        }
        this.formAvailableProducts.controls.forEach(c => {
          (c as FormArray).at(0).setValue(presetValue === 'all');
        });

        this.batchPublishForm.get('presetControl').setValue('');
      }),
      takeUntil(this.destroy$)
    );

    const process$ = this.isProcessingControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap((isProcessing: boolean) => {
        if (isProcessing) {
          this.batchPublishForm.disable();
          this.publishingInfo.progressPercent = 0;
          this.publishingInfo.successProducts = [];
          // this.publishingInfo.failedProducts = [];
          this.specificErrorMessages.clear();
        } else {
          this.batchPublishForm.enable();
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


  actionCloseModal() {
    this._dialogRef.close(this.didModifySomething);
  }


  actionBatchPublish() {
    if (this.batchPublishForm.disabled) {
      return;
    }

    this.isProcessingControl.setValue(true);
  }


  private extractSpendableBalance(utxos: PublicUTXO[] | AnonUTXO[] = []): number {
    const tempBal = new PartoshiAmount(0);

    for (const utxo of utxos) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount));
      }
    }

    return tempBal.particls();
  }


  private async publishProducts(): Promise<void> {
    const selectedMarketId = +this.batchPublishForm.get('selectedMarket').value;
    const selectedMarket = this.availableMarkets.find(m => m.id === selectedMarketId);

    if (!selectedMarket) {
      this.isProcessingControl.setValue(false);
      return;
    }

    const selectedDuration = +this.batchPublishForm.get('selectedDuration').value;
    const productsToProcess: [number, number, number, number][] = [];

    const productControls = this.formAvailableProducts.controls;

    this.availableProducts.forEach((product, productIndex) => {
      if (!!(productControls[productIndex] as FormArray).at(0).value) {
        productsToProcess.push([
          productIndex,  // for ease of reference later
          product.id,
          +(productControls[productIndex] as FormArray).at(1).value,
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
      const duration = detailsToPublish[3];

      await this._sellService.batchPublishProductToMarket(
        productId,
        {id: selectedMarketId, key: selectedMarket.key},
        categoryId,
        duration
      ).then(
        () => {
          this.didModifySomething = true;
          // Update the product with the current selected market/category values (avoids needing a complicated data "refresh")

          const foundMarket = this.availableProducts[productIndex].existingMarkets.find(m => m.marketId === selectedMarketId);

          if (foundMarket) {
            foundMarket.categoryId = categoryId;
          } else {
            this.availableProducts[productIndex].existingMarkets.push({
              categoryId,
              marketId: selectedMarketId
            });
          }

          // Let the template "know" that the publish was successful for this product
          this.publishingInfo.successProducts.push(productIndex);

          // Uncheck the product from being selected
          (this.formAvailableProducts.controls[productIndex] as FormArray).at(0).setValue(false);
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
        // this.publishingInfo.failedProducts.push(productIndex);
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
