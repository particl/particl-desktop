import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subject, of, merge } from 'rxjs';
import { takeUntil, tap, distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { SellService } from '../sell.service';
import { amountValidator, totalValueValidator, categorySelectedValidator, integerValidator } from './sell-template-form.validators';
import { TreeSelectComponent } from '../../shared/shared.module';
import { TemplateFormDetails } from '../sell.models';


@Component({
  selector: 'market-sell-template-form',
  templateUrl: './sell-template-form.component.html',
  styleUrls: ['./sell-template-form.component.scss']
})
export class SellTemplateFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() listingTemplate: TemplateFormDetails;
  @Input() regions$: Observable<{id: string, name: string}[]> = of([]);
  @Input() markets$: Observable<{id: number, name: string, image: string}[]> = of([]);
  @Input() categories$: Observable<{id: number, name: string}[]> = of([]);
  @Output() isValid: EventEmitter<boolean> = new EventEmitter();
  @Output() onChangeMarketId: EventEmitter<number> = new EventEmitter();
  @Output() onImageImportError: EventEmitter<void> = new EventEmitter();
  @Output() onRequestImageRemoval: EventEmitter<number> = new EventEmitter();


  templateForm: FormGroup;
  imagesPending: FormControl = new FormControl([]);

  readonly ESCROW_MAX: number = this._sellService.ESCROW_PERCENTAGE_MAX;
  readonly ESCROW_DEFAULT: number = this._sellService.ESCROW_PERCENTAGE_DEFAULT;

  readonly MAX_PRODUCT_CODE: number = 200;
  readonly MAX_TITLE: number = 100;
  readonly MAX_SHORT_DESCRIPTION: number = 300;
  readonly MAX_LONG_DESCRIPTION: number = 7500;
  readonly MAX_IMAGE_SIZE: number;
  readonly imageSizeLabel: string;

  private destroy$: Subject<void> = new Subject();
  private defaultCategoryId: number = 0;
  private categoryUpdateAction: FormControl = new FormControl(0);

  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;
  @ViewChild('shippingDestinationSelector', {static: false}) private selectorShipDestinations: TreeSelectComponent;
  @ViewChild('shippingOriginSelector', {static: false}) private selectorShipOrigin: TreeSelectComponent;
  @ViewChild('categorySelector', {static: false}) private selectorCategory: TreeSelectComponent;


  constructor(
    private _sellService: SellService
  ) {
    // The basic template information present on all templates
    this.templateForm = new FormGroup({
      productCode: new FormControl('', [Validators.maxLength(this.MAX_PRODUCT_CODE)]),
      title: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_TITLE)]),
      summary: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_SHORT_DESCRIPTION)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_LONG_DESCRIPTION)]),
      basePrice: new FormControl('', [Validators.required, amountValidator()]),
      priceShipLocal: new FormControl('', [Validators.required, amountValidator()]),
      escrowPercentageBuyer: new FormControl(
        this._sellService.ESCROW_PERCENTAGE_DEFAULT,
        [Validators.required, Validators.min(0), Validators.max(this._sellService.ESCROW_PERCENTAGE_MAX), integerValidator()]
      ),
      escrowPercentageSeller: new FormControl(
        this._sellService.ESCROW_PERCENTAGE_DEFAULT,
        [Validators.required, Validators.min(0), Validators.max(this._sellService.ESCROW_PERCENTAGE_MAX), integerValidator()]
      ),
      priceShipIntl: new FormControl('', [Validators.required, amountValidator()]),
      shippingOrigin: new FormControl('', [Validators.required]),
      shippingDestinations: new FormControl([]),
      images: new FormControl({value: [], disabled: true}),
      selectedMarket: new FormControl(0),
      selectedCategory: new FormControl(0),
      },
      [totalValueValidator, categorySelectedValidator]
    );

    this.MAX_IMAGE_SIZE = this._sellService.IMAGE_MAX_SIZE;
    this.imageSizeLabel = `${Math.round(Math.fround(this.MAX_IMAGE_SIZE / 1024))} KB`;
  }


  ngOnInit() {
    if (![undefined, null].includes(this.listingTemplate)) {
      this.setFormValues(this.listingTemplate);
    }


    const formChange$ = this.templateForm.statusChanges.pipe(
      // NB! emitted on every keystroke, which fits the current requirements, but might have potential issues in the future
      tap(() => this.isValid.emit(this.templateForm.valid)),
      takeUntil(this.destroy$)
    );

    const marketChange$ = this.markets$.pipe(
      tap(markets => {
        const currentMarketId = +this.selectedMarket.value;
        if ((currentMarketId > 0) && markets.findIndex(m => m.id === currentMarketId) === -1) {
          this.selectedMarket.setValue(0);
          this.categoryUpdateAction.setValue(0);
        }
      }),
      takeUntil(this.destroy$)
    );

    const categoryChange$ = this.categories$.pipe(
      tap(categories => {
        let selectedCatId = this.selectedCategory.value;
        if (!(+selectedCatId > 0)) {
          selectedCatId = this.defaultCategoryId;
        }

        this.categoryUpdateAction.setValue(selectedCatId);

      }),
      takeUntil(this.destroy$)
    );

    const categorySelection$ = this.categoryUpdateAction.valueChanges.pipe(
      // The debounceTime here is necessary to give the tree-select some time to load before attempting to reset the actual value.
      //  This is a bullshit way to do this and ends up in a potential race condition... fortunately mitigated somewhat by
      //  having the category tree-select component only display when there are category items. This definitely has its own issues though..
      //  but can be fixed later when there is less time constraints.
      debounceTime(250),
      tap((catId) => {
        this.selectedCategory.setValue(catId);
        if (this.selectorCategory) {
          this.selectorCategory.resetSelection(catId);
        }
      }),
      takeUntil(this.destroy$)
    );

    const userSelectedMarket$ = this.selectedMarket.valueChanges.pipe(
      distinctUntilChanged(),
      tap((marketId) => this.onChangeMarketId.emit(marketId)),
      takeUntil(this.destroy$)
    );

    merge(
      formChange$,
      marketChange$,
      categoryChange$,
      categorySelection$,
      userSelectedMarket$
    ).subscribe();

    // Initial emission of validity to ensure container receives correct validity initialization
    this.isValid.emit(this.templateForm.valid);
  }


  ngAfterViewInit() {
    const fileInput = this.fileInputSelector.nativeElement;
    const dropArea = this.dropArea.nativeElement;
    dropArea.ondragover = () => false;
    dropArea.ondragleave = () => false;
    dropArea.ondragend = () => false;

    dropArea.ondrop = (e: any) => {
      e.preventDefault();
      this.processPictures(e, true);
      return false;
    };
    fileInput.onchange = this.processPictures.bind(this);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get productCodeField(): AbstractControl {
    return this.templateForm.get('productCode');
  }


  get basePrice(): AbstractControl {
    return this.templateForm.get('basePrice');
  }

  get priceShipLocal(): AbstractControl {
    return this.templateForm.get('priceShipLocal');
  }

  get priceShipIntl(): AbstractControl {
    return this.templateForm.get('priceShipIntl');
  }

  get shippingOrigin(): AbstractControl {
    return this.templateForm.get('shippingOrigin');
  }

  get shippingDestinations(): AbstractControl {
    return this.templateForm.get('shippingDestinations');
  }

  get images(): AbstractControl {
    return this.templateForm.get('images');
  }

  get selectedCategory(): AbstractControl {
    return this.templateForm.get('selectedCategory');
  }

  get selectedMarket(): AbstractControl {
    return this.templateForm.get('selectedMarket');
  }


  addImage() {
    this.fileInputSelector.nativeElement.click();
  }


  removePendingImage(idx: number) {
    if (this.imagesPending.pending) {
      return;
    }
    (this.imagesPending.value as string[]).splice(idx, 1);
    this.imagesPending.updateValueAndValidity({onlySelf: true});
  }


  removeExistingImage(imageId: number) {
    if (this.images.pending) {
      return;
    }
    this.onRequestImageRemoval.emit(imageId);
    // removing from the images list with the assumption that the receiver does something to actually remove the image
    this.images.setValue(this.images.value.filter((img: {id: number, url: string}) => img.id !== imageId));
  }


  getFormValues(): {[key: string]: any} {
    const controls = Object.keys(this.templateForm.controls);
    const values = {};
    controls.forEach(control => {
      values[control] = this.templateForm.controls[control].value;
      if (typeof values[control] === 'string') {
        values[control] = values[control].trim();
      }
    });
    values['pendingImages'] = this.imagesPending.value;
    return values;
  }


  resetFormDetails(templ: TemplateFormDetails): void {
    this.setFormValues(templ);
  }


  private processPictures(event: any, dnd: boolean = false) {
    let sourceFiles: File[] = [];
    if (dnd) {
      for (const f of event.dataTransfer.files) {
        sourceFiles.push(f as File);
      }
    } else {
      sourceFiles = Array.from(event.target.files);
    }

    let failedImgs = false;
    sourceFiles.forEach((file: File) => {
      if (file.size > this.MAX_IMAGE_SIZE) {
        failedImgs = true;
      } else {
        const reader = new FileReader();
        reader.onloadend = (_event) => {
          if (reader.readyState === 2) {
            const res = <ArrayBuffer>reader.result;
            const uint = new Uint8Array(res, 0, 4);
            const bytes = [];
            uint.forEach(byte => {
              bytes.push(byte.toString(16));
            });
            const hex = bytes.join('').toUpperCase();
            if (this.isSupportedImageType(hex)) {
              const dataReader = new FileReader();

              dataReader.onload = _ev => {
                this.imagesPending.setValue([...this.imagesPending.value, <string>dataReader.result]);
              };
              dataReader.readAsDataURL(file);
            } else {
              this.onImageImportError.emit();
            }
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
    if (failedImgs) {
      this.onImageImportError.emit();
    }
    this.fileInputSelector.nativeElement.value = '';
  }


  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
  }


  private setFormValues(templ: TemplateFormDetails): void {
    this.imagesPending.setValue([]);

    this.templateForm.controls['title'].setValue(templ.title, {emitEvent: false});
    this.templateForm.controls['summary'].setValue(templ.summary, {emitEvent: false});
    this.templateForm.controls['description'].setValue(templ.description, {emitEvent: false});
    this.templateForm.controls['productCode'].setValue(templ.productCode, {emitEvent: false});

    this.templateForm.controls['basePrice'].setValue(templ.priceBase, {emitEvent: false});
    this.templateForm.controls['priceShipLocal'].setValue(templ.priceShipLocal, {emitEvent: false});
    this.templateForm.controls['priceShipIntl'].setValue(templ.priceShipIntl, {emitEvent: false});

    this.templateForm.controls['shippingOrigin'].setValue(templ.shippingOrigin, {emitEvent: false});
    this.templateForm.controls['shippingDestinations'].setValue(templ.shippingDestinations, { emitEvent: false });

    this.templateForm.controls['escrowPercentageBuyer'].setValue(templ.escrowPercentageBuyer, { emitEvent: false });
    this.templateForm.controls['escrowPercentageSeller'].setValue(templ.escrowPercentageSeller, { emitEvent: false });

    this.selectorShipOrigin.resetSelection(templ.shippingOrigin);
    this.selectorShipDestinations.resetSelection(templ.shippingDestinations);

    if (templ.category.selectedMarketCategoryId) {
      // set the temp category variable... when the market is updated, we then set this accordingly.
      //  Reasoning: the market dictates what categories are available. Thus, when setting the selected market below,
      //  the category list should invariably change.
      //  If it doesn't -> well, then setting the selected category is pretty pointless
      //  Else if the category list changes, then check if this temp category value is set and use it to set the selected category if it is
      // Yes, this is fucked up... but that describes this whole template functionality anyway.
      this.defaultCategoryId = templ.category.selectedMarketCategoryId;
    }
    if (!templ.category.canEdit) {
      this.templateForm.controls['selectedCategory'].disable();
    }

    if (templ.market.selectedMarketId && (templ.market.selectedMarketId !== this.templateForm.controls['selectedMarket'].value)) {
      this.templateForm.controls['selectedMarket'].setValue(templ.market.selectedMarketId, {emitEvent: false});
    }
    if (!templ.market.canEdit) {
      this.templateForm.controls['selectedMarket'].disable();
      this.templateForm.controls['productCode'].disable();
    }

    this.templateForm.controls['images'].setValue(templ.savedImages);
    if (Array.isArray(templ.pendingImages)) {
      this.imagesPending.setValue(templ.pendingImages);
    }
  }
}
