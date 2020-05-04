import { Component, OnInit, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, BehaviorSubject, of, Observable, merge, iif, defer } from 'rxjs';
import { tap, takeUntil, distinctUntilChanged, map, catchError, concatMap, finalize } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { WalletUTXOState } from 'app/main/store/main.state';
import { DataService } from '../../../services/data/data.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SellService } from '../../sell.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { WalletUTXOStateModel, PublicUTXO } from 'app/main/store/main.models';
import { CategoryItem, Market } from '../../../services/data/data.models';
import { PartoshiAmount } from 'app/core/util/utils';


interface PublishTemplateModalInputs {
  templateID: number;
}


enum TextContent {
  CATEGORY_ADD_SUCCESS = 'Successfully created the new category',
  CATEGORY_ADD_FAILURE = 'An error occurred while adding the category'
}


@Component({
  templateUrl: './publish-template-modal.component.html',
  styleUrls: ['./publish-template-modal.component.scss']
})
export class PublishTemplateModalComponent implements OnInit, OnDestroy {

  @Output() isConfirmed: EventEmitter<{market: number, category: number, duration: number}> = new EventEmitter();

  currentIdentity: string = '';
  currentBalance: string = '';
  feeEstimate: number = null;
  selectedMarket: FormControl = new FormControl();
  selectedCategory: FormControl = new FormControl();
  selectedDuration: FormControl = new FormControl();
  hasEstimateError: boolean = false;
  canCreateCategoryToggled: FormControl = new FormControl(false);
  useRootCategory: boolean = true;
  newCategoryRoot: FormControl = new FormControl(0);
  newCategoryName: string = '';


  availableMarkets: Market[] = [];
  availableCategories$: Observable<CategoryItem[]>;

  readonly availableDurations: Array<{title: string; value: number}> = [
    { title: '1 day', value: 1 },
    { title: '2 days', value: 2 },
    { title: '4 days', value: 4 },
    { title: '1 week', value: 7 }
  ];

  private destroy$: Subject<void> = new Subject();
  private categories$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([]);

  private canCreateCategory: FormControl = new FormControl(false);
  private marketsRootCategory: number = 0;
  private isAddingCategory: boolean = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PublishTemplateModalInputs,
    private _dialogRef: MatDialogRef<PublishTemplateModalComponent>,
    private _store: Store,
    private _dataService: DataService,
    private _unlocker: WalletEncryptionService,
    private _sellService: SellService,
    private _snackbar: SnackbarService
  ) {
    this.availableCategories$ = this.categories$.asObservable();
  }

  ngOnInit() {
    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap(() => {
        this.selectedMarket.setValue('');
        this.availableMarkets = [];
      }),
      concatMap((identity) => {
        if (identity && identity.id) {
          this.currentIdentity = identity.displayName;

          const currentProfile = this._store.selectSnapshot(MarketState.currentProfile);
          if (currentProfile && currentProfile.id) {
            return this._dataService.loadMarkets(currentProfile.id, identity.id).pipe(
              catchError(() => of([])),
              tap((markets: Market[]) => {
                this.availableMarkets = (markets || []).filter(m => m.type === 'MARKETPLACE' || m.type === 'STOREFRONT_ADMIN');
              })
            );
          }
        }
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    const marketChange$ = this.selectedMarket.valueChanges.pipe(
      tap((marketId: number) => {
        this.selectedCategory.setValue('');
        this.categories$.next([]);
        const market = this.availableMarkets.find(m => m.id === marketId);
        // this.canCreateCategory.setValue(true);
        this.canCreateCategory.setValue((market !== undefined) && (market.type === 'STOREFRONT_ADMIN'));
      }),
      concatMap((marketId: number) => {
        if (+marketId) {
          const market = this.availableMarkets.find(m => m.id === marketId);
          if (market && market.id) {
            return this._dataService.loadCategories(market.receiveAddress);
          }
        }
        return of({categories: [], rootId: 0});
      }),
      tap((categories) => {
        this.categories$.next(categories.categories);
        this.marketsRootCategory = categories.rootId;
      }),
      takeUntil(this.destroy$)
    );


    const durationChange$ = this.selectedDuration.valueChanges.pipe(
      distinctUntilChanged(),
      tap(() => {
        this.hasEstimateError = false;
        this.feeEstimate = null;
      }),
      takeUntil(this.destroy$)
    );

    const balanceChange$ = this._store.select(WalletUTXOState).pipe(
      map((utxos: WalletUTXOStateModel) => {
        this.currentBalance = this.extractSpendableBalance(utxos.public);
      }),
      takeUntil(this.destroy$)
    );


    const addCategoryToggle$ = this.canCreateCategory.valueChanges.pipe(
      tap((value: boolean) => {
        if (!value) {
          this.canCreateCategoryToggled.setValue(false);
        }
      }),
      takeUntil(this.destroy$)
    );


    const toggleCategory$ = this.canCreateCategoryToggled.valueChanges.pipe(
      distinctUntilChanged(),
      tap((value: boolean) => {
        if (!value) {
          this.useRootCategory = true;
          this.newCategoryRoot.setValue(0);
          this.newCategoryName = '';
        }
      }),
      takeUntil(this.destroy$)
    );


    const categoryRootSelected$ = this.newCategoryRoot.valueChanges.pipe(
      distinctUntilChanged(),
      tap((value: number) => {
        this.useRootCategory = !!!value;
      }),
      takeUntil(this.destroy$)
    );


    if (!(+this.data.templateID > 0)) {
      this.hasEstimateError = true;
    } else {
      merge(
        identityChange$,
        marketChange$,
        balanceChange$,
        durationChange$,
        addCategoryToggle$,
        toggleCategory$,
        categoryRootSelected$
      ).subscribe();
    }
  }


  ngOnDestroy() {
    this.categories$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  get isCategoryCreatable(): boolean {
    return this.canCreateCategory.value;
  }


  addNewCategory() {
    if (this.isAddingCategory || !this.isCategoryCreatable || (this.newCategoryName.length <= 0)) {
      return;
    }
    this.isAddingCategory = true;

    const catRoot = this.useRootCategory || !this.newCategoryRoot.value ? this.marketsRootCategory : this.newCategoryRoot.value;
    this._sellService.createNewCategory(this.newCategoryName, catRoot, this.selectedMarket.value).pipe(
      finalize(() => this.isAddingCategory = false)
    ).subscribe(
      () => {
        // force a refresh of the market categories
        this.selectedMarket.setValue(this.selectedMarket.value);
        this._snackbar.open(TextContent.CATEGORY_ADD_SUCCESS);
      },
      () => {
        this._snackbar.open(TextContent.CATEGORY_ADD_FAILURE, 'err');
      }
    );
  }


  estimateFee() {
    this.hasEstimateError = false;
    this.feeEstimate = -1;
    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap(
        (unlocked: boolean) => iif(
          () => unlocked,
          defer(
            () => this._sellService.publishTemplate(
              +this.data.templateID,
              this.selectedMarket.value,
              this.selectedCategory.value,
              this.selectedDuration.value, true
            ).pipe(
              tap((value) => this.feeEstimate = 1.11010101) // TODO: set the estimate fee here (no idea what the response looks like)
            )
          )
        )
      )
    ).subscribe(
      null,
      () => this.hasEstimateError = true
    );
  }


  doPublish() {
    if (
      (+this.selectedMarket.value > 0) &&
      (+this.selectedCategory.value > 0) &&
      (+this.selectedDuration.value > 0)
    ) {
      this.isConfirmed.emit({
        market: +this.selectedMarket.value,
        category: +this.selectedCategory.value,
        duration: +this.selectedDuration.value
      });
      this._dialogRef.close();
    }
  }


  private extractSpendableBalance(utxos: PublicUTXO[] = []): string {
    const tempBal = new PartoshiAmount(0);

    for (const utxo of utxos) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount * Math.pow(10, 8)));
      }
    }

    return tempBal.particlsString();
  }
}
