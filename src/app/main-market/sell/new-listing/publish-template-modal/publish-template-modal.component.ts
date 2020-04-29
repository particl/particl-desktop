import { Component, OnInit, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, BehaviorSubject, of, Observable, merge, iif, defer } from 'rxjs';
import { tap, takeUntil, distinctUntilChanged, map, catchError, concatMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { WalletUTXOState } from 'app/main/store/main.state';
import { DataService } from '../../../services/data/data.service';
import { SellService } from '../../sell.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { WalletUTXOStateModel, PublicUTXO } from 'app/main/store/main.models';
import { CategoryItem, Market } from '../../../services/data/data.models';
import { PartoshiAmount } from 'app/core/util/utils';


interface PublishTemplateModalInputs {
  templateID: number;
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

  availableMarkets: Market[] = [];
  availableCategories$: Observable<CategoryItem[]>;

  availableDurations: Array<{title: string; value: number}> = [
    { title: '1 day', value: 1 },
    { title: '2 days', value: 2 },
    { title: '4 days', value: 4 },
    { title: '1 week', value: 7 }
  ];

  private destroy$: Subject<void> = new Subject();
  private categories$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PublishTemplateModalInputs,
    private _dialogRef: MatDialogRef<PublishTemplateModalComponent>,
    private _store: Store,
    private _dataService: DataService,
    private _unlocker: WalletEncryptionService,
    private _sellService: SellService
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
                this.availableMarkets = markets || [];
              })
            );
          }
        }
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    const marketChange$ = this.selectedMarket.valueChanges.pipe(
      distinctUntilChanged(),
      tap(() => {
        this.selectedCategory.setValue('');
        this.categories$.next([]);
      }),
      concatMap((marketId: number) => {
        if (+marketId) {
          const market = this.availableMarkets.find(m => m.id === marketId);
          if (market && market.id) {
            return this._dataService.loadCategories(market.receiveAddress);
          }
        }
        return of([]);
      }),
      tap((categories: CategoryItem[]) => {
        this.categories$.next(categories);
      }),
      takeUntil(this.destroy$)
    );


    const durationChange$ = this.selectedDuration.valueChanges.pipe(
      distinctUntilChanged(),
      tap((value: number) => {
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


    if (!(+this.data.templateID > 0)) {
      this.hasEstimateError = true;
    } else {
      merge(
        identityChange$,
        marketChange$,
        balanceChange$,
        durationChange$
      ).subscribe();
    }
  }


  ngOnDestroy() {
    this.categories$.complete();
    this.destroy$.next();
    this.destroy$.complete();
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
