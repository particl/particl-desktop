import { Component, Input, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, Subject, merge } from 'rxjs';
import { takeUntil, tap, distinctUntilChanged, mapTo, catchError } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SellService } from 'app/main-market/sell/sell.service';
import { SellTemplateFormComponent } from '../../../sell-template-form/sell-template-form.component';
import { getValueOrDefault } from 'app/main-market/shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';
import { TemplateFormDetails, CreateTemplateRequest, TemplateRequestImageItem } from '../../../sell.models';
import { ESCROW_RELEASE_TYPE } from '../../../../shared/market.models';


enum TextContent {
  ERROR_IMAGE_ADD = 'One or more images selected were not valid',
}


@Component({
  templateUrl: './imported-template-item.component.html',
  styleUrls: ['./imported-template-item.component.scss']
})
export class ImportTemplateItemComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() onValidityChange: EventEmitter<boolean> = new EventEmitter();

  @Input() template: TemplateFormDetails = null;
  @Input() regions$: Observable<{id: string, name: string}[]>;

  readonly markets$: Observable<{id: number; name: string}[]> = of([]);
  readonly categories$: Observable<{id: number; name: string}[]> = of([]);
  isFormValidControl: FormControl = new FormControl(false);
  importControl: FormControl = new FormControl(true);
  displayControls: boolean = true;
  hasProcessingError: boolean = false;


  private destroy$: Subject<void> = new Subject();
  @ViewChild(SellTemplateFormComponent, {static: true}) private templateForm: SellTemplateFormComponent;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _snackbar: SnackbarService,
    private _sellService: SellService
  ) {}


  ngOnInit() {
    const validity$ = this.isFormValidControl.valueChanges.pipe(
      tap(() => {
        if (this.hasProcessingError) {
          this.hasProcessingError = false;
        }
      }),
      distinctUntilChanged(),
      tap(isValid => {
        this.importControl.setValue(isValid);

        if (isValid && this.importControl.disabled) {
          this.importControl.enable();
        } else if (!isValid && this.importControl.enabled) {
          this.importControl.disable();
        }
      }),
      takeUntil(this.destroy$)
    );

    const selected$ = this.importControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(isSelected => {
        this.onValidityChange.emit(isSelected);
      }),
      takeUntil(this.destroy$)
    );

    merge(
      validity$,
      selected$
    ).subscribe();
  }


  ngAfterViewInit() {
    this.templateForm.resetFormDetails(this.template);
    this._cdr.detectChanges();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionImageAddError(): void {
    this._snackbar.open(TextContent.ERROR_IMAGE_ADD);
  }


  getTemplateCreationObservable(): Observable<boolean> {
    if (!this.isFormValidControl.value || !this.importControl.value) {
      return of();  // basically, returning empty() that completes immediately
    }

    const formValues = this.templateForm.getFormValues();

    const parsedBasePrice = getValueOrDefault(formValues['basePrice'], 'string', '');
    const parsedShipLocalPrice = getValueOrDefault(formValues['priceShipLocal'], 'string', '');
    const parsedShpIntlPrice = getValueOrDefault(formValues['priceShipIntl'], 'string', '');

    const parsedValues = {
      title: getValueOrDefault(formValues['title'], 'string', ''),
      summary: getValueOrDefault(formValues['summary'], 'string', ''),
      description: getValueOrDefault(formValues['description'], 'string', ''),
      basePrice: +parsedBasePrice > 0 ? parsedBasePrice : '0',
      domesticShippingPrice: +parsedShipLocalPrice > 0 ? parsedShipLocalPrice : '0',
      foreignShippingPrice: +parsedShpIntlPrice > 0 ? parsedShpIntlPrice : '0',
      images: Array.isArray(formValues['pendingImages']) ?
          formValues['pendingImages'].map((image: string) => {
            const imgData: TemplateRequestImageItem = {type: 'REQUEST', data: image};
            return imgData;
          }) :
          [],
      shippingFrom: getValueOrDefault(formValues['shippingOrigin'], 'string', ''),
      shippingTo: Array.isArray(formValues['shippingDestinations']) ? (formValues['shippingDestinations'] as string[]) : [],
      selectedMarketId: +formValues['selectedMarket'] > 0 ? +formValues['selectedMarket'] : 0,
      selectedCategoryId: +formValues['selectedCategory'] > 0 ? +formValues['selectedCategory'] : 0,
    };

    const newTemplateData: CreateTemplateRequest = {
      title: parsedValues.title,
      summary: parsedValues.summary,
      description: parsedValues.description,
      images: parsedValues.images,
      priceBase: (new PartoshiAmount(+parsedValues.basePrice)).partoshis(),
      priceShippingLocal: (new PartoshiAmount(+parsedValues.domesticShippingPrice)).partoshis(),
      priceShippingIntl: (new PartoshiAmount(+parsedValues.foreignShippingPrice)).partoshis(),
      shippingFrom: parsedValues.shippingFrom,
      shippingTo: parsedValues.shippingTo,
      escrowType: 'MAD_CT',
      escrowReleaseType: ESCROW_RELEASE_TYPE.ANON,
      escrowBuyerRatio: 100,
      escrowSellerRatio: 100,
      salesType: 'SALE',
      currency: 'PART',
      marketId: parsedValues.selectedMarketId,
      categoryId: parsedValues.selectedCategoryId
    };

    return this._sellService.createNewTemplate(newTemplateData).pipe(
      mapTo(true),
      catchError(() => of(false)),
      tap(isSuccessful => {
        if (isSuccessful) {
          this.destroy$.next();
          this.importControl.setValue(false, {emitEvent: false});
          this.importControl.disable();
          this.displayControls = false;
        } else {
          this.hasProcessingError = true;
        }
      })
    );

  }

}
