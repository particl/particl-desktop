import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, of, Observable, merge, from } from 'rxjs';
import { tap, takeUntil, catchError, concatAll } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { WalletUTXOState } from 'app/main/store/main.state';

import { SellService } from '../../sell.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { isBasicObjectType, getValueOrDefault } from 'app/main-market/shared/utils';
import { PublishDurations } from '../../sell.models';
import { WalletUTXOStateModel, PublicUTXO } from 'app/main/store/main.models';


interface TemplateDetails {
  templateID: number;
  title: string;
  templateImage?: string;
  marketName: string;
  marketImage?: string;
  categoryName: string;
}


// tslint:disable:no-empty-interface
export interface PublishTemplateModalInputs extends TemplateDetails {}
// tslint:enable:no-empty-interface


@Component({
  templateUrl: './publish-template-modal.component.html',
  styleUrls: ['./publish-template-modal.component.scss']
})
export class PublishTemplateModalComponent implements OnInit, OnDestroy {

  currentIdentity: { name: string; image: string; } = {
    name: '',
    image: ''
  };

  currentBalance: number = 0;
  selectedDuration: FormControl = new FormControl(0);
  selectedDurationOptionIndex: number = -1;
  formIsValid: FormControl = new FormControl(false);

  readonly templateDetails: TemplateDetails;

  readonly availableDurations: Array<{title: string; value: number, estimateFee: number }> = PublishDurations.map(
    pd => ({...pd, estimateFee: -1})
  );


  private destroy$: Subject<void> = new Subject();
  private isDataValid: boolean = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PublishTemplateModalInputs,
    private _dialogRef: MatDialogRef<PublishTemplateModalComponent>,
    private _store: Store,
    private _sellService: SellService,
  ) {

    const defaultImgPath = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;

    const actualData: TemplateDetails = {
      templateID: 0,
      templateImage: defaultImgPath,
      title: '',
      marketName: '',
      marketImage: defaultImgPath,
      categoryName: '',
    };

    if (isBasicObjectType(this.data)) {

      actualData.templateID = +this.data.templateID > 0 ? +this.data.templateID : actualData.templateID;
      actualData.title = getValueOrDefault(this.data.title, 'string', actualData.title);
      actualData.marketName = getValueOrDefault(this.data.marketName, 'string', actualData.marketName);
      actualData.categoryName = getValueOrDefault(this.data.categoryName, 'string', actualData.categoryName);
      actualData.templateImage = getValueOrDefault(this.data.templateImage, 'string', actualData.templateImage);
      actualData.marketImage = getValueOrDefault(this.data.marketImage, 'string', actualData.marketImage);
    }

    this.isDataValid = actualData.templateID > 0;
    this.templateDetails = actualData;

  }


  ngOnInit() {

    let init$: Observable<any> = of(null);

    if (this.isDataValid) {
      const durations$: Observable<any>[] = [];

      for (const duration of this.availableDurations) {
        durations$.push(
          this._sellService.estimatePublishFee(this.templateDetails.templateID, duration.value).pipe(
            tap((amount) => duration.estimateFee = amount),
            catchError(() => of(duration.value)),
          )
        );
      }

      init$ = from(durations$).pipe(
        concatAll()
      );
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
        this.currentBalance = this.extractSpendableBalance(utxos.public);
      }),
      takeUntil(this.destroy$)
    );

    const durationChange$ = this.selectedDuration.valueChanges.pipe(
      tap((value) => {
        this.selectedDurationOptionIndex = this.availableDurations.findIndex(ad => ad.value === +value);
      }),
      takeUntil(this.destroy$)
    );

    const validity$ = merge(
      balanceChange$,
      durationChange$,
    ).pipe(
      tap(() => {
        this.formIsValid.setValue(
          this.isDataValid &&
          (this.selectedDurationOptionIndex > -1) &&
          (+this.availableDurations[this.selectedDurationOptionIndex].estimateFee > 0) &&
          (+this.availableDurations[this.selectedDurationOptionIndex].estimateFee <= +this.currentBalance)
        );
      }),
      takeUntil(this.destroy$)
    );


    merge(
      identityChange$,
      validity$,
      init$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  doPublish() {
    if (!this.formIsValid.value) {
      return;
    }

    this._dialogRef.close({duration: +this.selectedDuration.value});
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
