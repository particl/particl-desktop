import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { Subject, merge } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { WalletUTXOState } from 'app/main/store/main.state';
import { MarketState } from '../../../store/market.state';

import { MarketManagementService } from '../../management.service';
import { WalletUTXOStateModel, PublicUTXO } from 'app/main/store/main.models';
import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';
import { GenericModalInfo } from '../joined-markets.models';


function SufficientBalanceValidator(): ValidatorFn {
  return (control: FormGroup): ValidationErrors | null => {
    const fee = control.get('selectedFee');
    const balance = control.get('currentBalance');

    if (fee && balance && (+balance.value >= +fee.value)) {
      return null;
    }
    return { 'sufficientbalance': true };
  };
}


@Component({
  templateUrl: './promote-market-modal.component.html',
  styleUrls: ['./promote-market-modal.component.scss']
})
export class PromoteMarketConfirmationModalComponent implements OnInit, OnDestroy {

  currentIdentity: { name: string; image: string; } = {
    name: '',
    image: ''
  };

  readonly publishForm: FormGroup;
  readonly marketName: string = '';

  readonly optionsPublishDurations: {title: string, value: number, estimateFee: number}[] = [
    { title: '1 day', value: 1, estimateFee: 0 },
    { title: '2 days', value: 3, estimateFee: 0 },
    { title: '4 days', value: 5, estimateFee: 0 },
    { title: '1 week', value: 7, estimateFee: 0 }
  ];


  private destroy$: Subject<void> = new Subject();
  private readonly marketId: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericModalInfo,
    private _dialogRef: MatDialogRef<PromoteMarketConfirmationModalComponent>,
    private _store: Store,
    private _manageService: MarketManagementService,
  ) {

    this.publishForm = new FormGroup({
      selectedDuration: new FormControl(0, [Validators.min(1)]),
      selectedFee: new FormControl(0, [Validators.min(0.000_000_01)]),
      currentBalance: new FormControl(0),
    }, [
      SufficientBalanceValidator()
    ]);

    let marketName = '';
    let marketId = 0;

    if (isBasicObjectType(data) && isBasicObjectType(data.market)) {
      marketName = getValueOrDefault(data.market.name, 'string', marketName);
      marketId = +data.market.id > 0 ? +data.market.id : marketId;
    }

    this.marketName = marketName;
    this.marketId = marketId;

    if (this.marketId === 0) {
      this.publishForm.get('selectedDuration').disable();
    }
  }


  ngOnInit() {
    if (this.publishForm.get('selectedDuration').enabled && (this.optionsPublishDurations.length > 0)) {
      this.optionsPublishDurations.sort((a, b) => a.value - b.value);

      const baseDuration = this.optionsPublishDurations.find(opt => opt.value > 0);
      if (baseDuration) {
        this._manageService.estimateMarketPromotionFee(this.marketId, baseDuration.value).subscribe(
          (fee) => {
            this.optionsPublishDurations.forEach(opt => {
              opt.estimateFee = new PartoshiAmount(opt.value / baseDuration.value).multiply(fee).particls();
            });
          }
        );
      }
    }

    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((identity) => {
        this.currentIdentity.name = identity.displayName;
        this.currentIdentity.image = identity.displayName[0].toLocaleUpperCase();
      }),
      takeUntil(this.destroy$)
    );

    const balanceChange$ = this._store.select(WalletUTXOState).pipe(
      tap((utxos: WalletUTXOStateModel) => {
        this.publishForm.get('currentBalance').setValue(this.extractSpendableBalance(utxos.public));
      }),
      takeUntil(this.destroy$)
    );

    const durationChange$ = this.publishForm.get('selectedDuration').valueChanges.pipe(
      tap((value) => {
        const foundOption = this.optionsPublishDurations.find(opt => opt.value === value);
        this.publishForm.get('selectedFee').setValue(foundOption ? foundOption.estimateFee : 0);
      }),
      takeUntil(this.destroy$)
    );

    merge(
      identityChange$,
      balanceChange$,
      durationChange$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get selectedDurationControl(): AbstractControl {
    return this.publishForm.get('selectedDuration');
  }

  get selectedFeeControl(): AbstractControl {
    return this.publishForm.get('selectedFee');
  }

  get currentBalanceControl(): AbstractControl {
    return this.publishForm.get('currentBalance');
  }


  doAction() {
    this._dialogRef.close(+this.selectedDurationControl.value);
  }


  private extractSpendableBalance(utxos: PublicUTXO[] = []): number {
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
}
