import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, of, Observable, merge, iif, defer } from 'rxjs';
import { tap, takeUntil, map, catchError, switchMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { WalletUTXOState } from 'app/main/store/main.state';

import { SellService } from '../../sell.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { isBasicObjectType, getValueOrDefault } from 'app/main-market/shared/utils';
import { PublishDurations, PublishWarnings } from '../../sell.models';


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
  warningConfirmation: FormControl = new FormControl(false);
  selectedDurationOptionIndex: number = -1;
  formIsValid: FormControl = new FormControl(false);
  hasWarnings: boolean = false;


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

    let init$: Observable<number> = of(0);

    if (this.isDataValid) {

      this.availableDurations.sort((a, b) => a.value - b.value);

      const baseDuration = this.availableDurations.find(d => d.value > 0);
      if (baseDuration) {
        init$ = this._sellService.estimatePublishFee(this.templateDetails.templateID, baseDuration.value).pipe(
          tap(({fee, warnings}) => {
            if (+fee > 0) {
              this.availableDurations.forEach(dur => {
                dur.estimateFee = new PartoshiAmount(dur.value / baseDuration.value).multiply(fee).particls();
              });

              if (warnings.includes(PublishWarnings.INSUFFICIENT_UTXOS)) {
                this.hasWarnings = true;
              }
            }
          }),
          map(({ fee }) => +fee),
          catchError(() => of(0)) // basically, do nothing if there is an error
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

    const balanceChange$ = this._store.select(MarketState.settings).pipe(
      switchMap((settings) => iif(
        () => settings.useAnonBalanceForFees,

        defer(() => this._store.select(WalletUTXOState.spendableAmountAnon())),
        defer(() => this._store.select(WalletUTXOState.spendableAmountPublic())),
      )),
      map(value => +value),
      tap((balance) => this.currentBalance = balance),
      takeUntil(this.destroy$),
    );


    const durationChange$ = this.selectedDuration.valueChanges.pipe(
      tap((value) => {
        this.selectedDurationOptionIndex = this.availableDurations.findIndex(ad => ad.value === +value);
      }),
      takeUntil(this.destroy$)
    );

    const warnings$ = this.warningConfirmation.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    const validity$ = merge(
      balanceChange$,
      durationChange$,
      warnings$,
      init$
    ).pipe(
      tap(() => {
        this.formIsValid.setValue(
          this.isDataValid &&
          (this.selectedDurationOptionIndex > -1) &&
          (+this.availableDurations[this.selectedDurationOptionIndex].estimateFee > 0) &&
          (+this.availableDurations[this.selectedDurationOptionIndex].estimateFee <= +this.currentBalance) &&
          (this.hasWarnings ? this.warningConfirmation.value : true)
        );
      }),
      takeUntil(this.destroy$)
    );


    merge(
      identityChange$,
      validity$
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
}
