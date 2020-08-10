import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { amountValidator, totalValueValidator } from './sell-template-form.validators';
// import { BaseTemplate, MarketTemplate } from '../sell.models';


@Component({
  selector: 'market-sell-template-form',
  templateUrl: './sell-template-form.component.html',
  styleUrls: ['./sell-template-form.component.scss']
})
export class SellTemplateFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() listingTemplate: any;
  @Input() regions$: Observable<{id: string, name: string}[]> = of([]);
  @Output() isValid: EventEmitter<boolean> = new EventEmitter();
  @Output() onImageImportError: EventEmitter<void> = new EventEmitter();
  @Output() onRequestImageRemoval: EventEmitter<number> = new EventEmitter();


  templateForm: FormGroup;
  imagesPending: FormControl = new FormControl([]);

  readonly MAX_TITLE: number = 50;
  readonly MAX_SHORT_DESCRIPTION: number = 200;
  readonly MAX_LONG_DESCRIPTION: number = 8000;

  // @TODO: only for testing, pls remove and properly implement:
  feeCalculated: boolean = false;

  currentIdentity: string = '';
  currentBalance: string = '';

  readonly publishDuration: Array<{title: string; value: number}> = [
    { title: '1 day', value: 1 },
    { title: '2 days', value: 2 },
    { title: '4 days', value: 4 },
    { title: '1 week', value: 7 }
  ];

  readonly categories: Array<{title: string; value: string}> = [
    { title: 'Furniture', value: 'f' },
    { title: 'Yachts', value: 'y' },
    { title: 'Bots', value: 'b' },
    { title: 'Electronics', value: 'e' }
  ];

  private destroy$: Subject<void> = new Subject();
  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;

  constructor() {
    // The basic template information present on all templates
    this.templateForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_TITLE)]),
      summary: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_SHORT_DESCRIPTION)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_LONG_DESCRIPTION)]),
      basePrice: new FormControl('', [Validators.required, amountValidator()]),
      priceShipLocal: new FormControl('', [Validators.required, amountValidator()]),
      priceShipIntl: new FormControl('', [Validators.required, amountValidator()]),
      shippingOrigin: new FormControl('', [Validators.required]),
      shippingDestinations: new FormControl([]),
      images: new FormControl({value: [], disabled: true})
    },
    [totalValueValidator]);
  }


  ngOnInit() {
    if (![undefined, null].includes(this.listingTemplate)) {
      this.setFormValues(this.listingTemplate);
    }

    this.templateForm.statusChanges.pipe(
      // NB! emitted on every keystroke it seems, which fits the current requirements, but might have potential issues in the future
      tap(() => this.isValid.emit(this.templateForm.valid)),
      takeUntil(this.destroy$)
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
    values['pendingImages'] = this.imagesPending;
    return values;
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

    const MAX_IMAGE_SIZE = 1024 * 1024 * 2; // (2MB)
    let failedImgs = false;
    sourceFiles.forEach((file: File) => {
      if (file.size > MAX_IMAGE_SIZE) {
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


  private setFormValues(template: any): void {
    this.imagesPending.setValue([]);

    this.templateForm.controls['title'].setValue(
      typeof template.details.information.title === 'string' ? template.details.information.title : ''
    );
    this.templateForm.controls['summary'].setValue(
      typeof template.details.information.summary === 'string' ? template.details.information.summary : ''
    );
    this.templateForm.controls['description'].setValue(
      typeof template.details.information.description === 'string' ? template.details.information.description : ''
    );

    this.templateForm.controls['basePrice'].setValue(template.details.price.basePrice.particlsString());
    this.templateForm.controls['priceShipLocal'].setValue(template.details.price.shippingLocal.particlsString());
    this.templateForm.controls['priceShipIntl'].setValue(template.details.price.shippingInternational.particlsString());

    this.templateForm.controls['shippingOrigin'].setValue(
      typeof template.details.shippingOrigin.countryCode === 'string' ? template.details.shippingOrigin.countryCode : ''
    );
    this.templateForm.controls['shippingDestinations'].setValue(template.details.shippingDestinations.map(dest => dest.countryCode));

    const savedImages = (template.details.images).map(
      image => ({id: image.id, url: image.thumbnailUrl})
    ).filter(
      img => !!(img && img.id && img.url)
    );
    this.templateForm.controls['images'].setValue(savedImages);
  }
}
