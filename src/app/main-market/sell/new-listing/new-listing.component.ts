import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, BehaviorSubject, of, throwError, defer, iif } from 'rxjs';
import { take, map, concatMap, tap, catchError, takeUntil, finalize } from 'rxjs/operators';
import { RegionListService } from '../../services/region-list/region-list.service';
import { SellService } from '../sell.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { amountValidator, totalValueValidator } from './new-listing.validators';
import { Country } from '../../services/data/data.models';
import { NewTemplateData, ListingTemplate } from '../sell.models';


enum TextContent {
  ERROR_EXISTING_TEMPLATE_FETCH = 'Could not find the saved template, please try again',
  ERROR_MAX_SIZE = 'maximum listing size exceeded - try to reduce image or text sizes',
  ERROR_FAILED_SAVE = 'Could not save the changes to the template',
  ERROR_IMAGE_REMOVAL = 'Could not remove the specified image',
  BUTTON_LABEL_SAVE = 'Save',
  BUTTON_LABEL_UPDATE = 'Update',
  BUTTON_LABEL_PUBLISH_NEW = 'Save and Publish',
  BUTTON_LABEL_PUBLISH_EXISTING = 'Update and Publish',
  IMAGE_SELECTION_FAILED = 'One or more images were not included in for selection',
  PROCESSING_TEMPLATE_SAVE = 'Saving the current changes'
}


@Component({
  templateUrl: './new-listing.component.html',
  styleUrls: ['./new-listing.component.scss']
})
export class NewListingComponent implements OnInit, AfterViewInit, OnDestroy {

  templateForm: FormGroup;
  errorMessage: string = '';
  saveButtonText: string = '';
  publishButtonText: string = '';
  imagesPending: FormControl = new FormControl([]);

  regionList$: BehaviorSubject<Country[]> = new BehaviorSubject([]);

  readonly MAX_TITLE: number = 50;
  readonly MAX_SHORT_DESCRIPTION: number = 200;
  readonly MAX_LONG_DESCRIPTION: number = 8000;

  private destroy$: Subject<void> = new Subject();
  private templateID: FormControl = new FormControl(0);

  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _route: ActivatedRoute,
    private _regionService: RegionListService,
    private _sellService: SellService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) {
    this.templateForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_TITLE)]),
      shortDescription: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_SHORT_DESCRIPTION)]),
      longDescription: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_LONG_DESCRIPTION)]),
      basePrice: new FormControl('', [Validators.required, amountValidator()]),
      priceShipLocal: new FormControl('', [Validators.required, amountValidator()]),
      priceShipIntl: new FormControl('', [Validators.required, amountValidator()]),
      sourceRegion: new FormControl('', [Validators.required]),
      targetRegions: new FormControl([]),
      images: new FormControl({value: [], disabled: true})
    },
    [totalValueValidator]);
  }


  ngOnInit() {

    const regions$ = defer(() => {
      const regions = this._regionService.getCountryList().map(c => ({id: c.iso, name: c.name}));
      this.regionList$.next(regions);
    });

    this.templateID.valueChanges.pipe(
      // fetch the latest template if there is one to fetch
      concatMap((templateId: number) => {
        if (templateId) {
          return this._sellService.fetchTemplate(templateId).pipe(
            catchError(() => {
              return throwError('template fetch failed');
            })
          );
        }
        return of(null);
      }),

      // ensure that the parsing of any fetched template is done correctly
      tap((existing: ListingTemplate) => {
        if (!existing) {
          if (this.templateID.value) {
            // failed to save an existing form
            throwError('failed to save template changes');
          } else {
            // new template
            this.saveButtonText = TextContent.BUTTON_LABEL_SAVE;
            this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_NEW;
          }
          return;
        }

        this.setFormValues(existing);
        this.imagesPending.setValue([]);
      }),

      // finally, ensure that the regionList, if it has not been set yet, is built correctly
      concatMap(() => iif(() => this.regionList$.value.length === 0, regions$)),
      takeUntil(this.destroy$)
    ).subscribe(
      null,
      (err) => this.errorMessage = err === 'template fetch failed' ?
          TextContent.ERROR_EXISTING_TEMPLATE_FETCH : TextContent.ERROR_FAILED_SAVE
    );

    this._route.queryParams.pipe(
      take(1),
      map(params => +params['templateID']),
      tap((id: number) => {
        this.templateID.setValue(id || 0);
      })
    ).subscribe();
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
    this.regionList$.complete();
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

  get sourceRegion(): AbstractControl {
    return this.templateForm.get('sourceRegion');
  }

  get targetRegions(): AbstractControl {
    return this.templateForm.get('targetRegions');
  }

  get images(): AbstractControl {
    return this.templateForm.get('images');
  }


  saveTemplate() {
    if (this.templateForm.invalid) {
      return;
    }

    this.doTemplateSave().subscribe(
      (templateID) => this.templateID.setValue(templateID),
      () => this._snackbar.open(TextContent.ERROR_FAILED_SAVE)
    );
  }


  publishTemplate() {
    // TODO
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
    this._sellService.removeTemplateImage(imageId).subscribe(
      () => {
        this.images.setValue(this.images.value.filter((img: {id: number, url: string}) => img.id !== imageId));
      },
      () => this._snackbar.open(TextContent.ERROR_IMAGE_REMOVAL)
    );
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
            // @TODO: add error message once all images processed indicating that 1 or more failed
            //  Not added here, because this is eventing on multiple objects
            //  (using counters requires locks to ensure atomic counter updates)
            if (this.isSupportedImageType(hex)) {
              const dataReader = new FileReader();

              dataReader.onload = _ev => {
                this.imagesPending.setValue([...this.imagesPending.value, <string>dataReader.result]);
              };
              dataReader.readAsDataURL(file);
            }
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
    if (failedImgs) {
      this._snackbar.open(TextContent.IMAGE_SELECTION_FAILED);
    }
    this.fileInputSelector.nativeElement.value = '';
  }


  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
  }


  private doTemplateSave(): Observable<number> {

    const dialog = this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: { message: TextContent.PROCESSING_TEMPLATE_SAVE }
    });

    let update$: Observable<number>;

    const controls = this.templateForm.controls;
    const fieldNames = Object.keys(controls);

    const modified = {};
    for (const fieldName of fieldNames) {
      // The check for the additional fieldnames here occurs because their values are set programatically,
      //  (and not via direct user modification). Angular cannot detect such modification as being dirty, so for now,
      //  just force these to be included in the fields to be updated.
      if (controls[fieldName].dirty || ['sourceRegion', 'targetRegions'].includes(fieldName)) {
        modified[fieldName] = controls[fieldName].value;
      }
    }

    if (+this.templateID.value <= 0) {
      // perform save
      const newTemplateData: NewTemplateData = {
        title: modified['title'] || '',
        shortDescription: modified['shortDescription'] || '',
        longDescription: modified['longDescription'] || '',
        basePrice: +modified['basePrice'] || 0,
        domesticShippingPrice: +modified['priceShipLocal'] || 0,
        foreignShippingPrice: +modified['priceShipIntl'] || 0,
        images: this.imagesPending.value.map((image: string) => ({type: 'LOCAL', encoding: 'BASE64', data: image})),
        shippingFrom: modified['sourceRegion'],
        shippingTo: modified['targetRegions'],
        escrowType: 'MAD_CT',
        escrowBuyerRatio: 100,
        escrowSellerRatio: 100,
        salesType: 'SALE',
        currency: 'PART'
      };

      update$ = this._sellService.createNewTemplate(newTemplateData);
    } else {
      // TODO perform update
      update$ = of(this.templateID.value);
    }

    return update$.pipe(
      finalize(() => this._dialog.getDialogById(dialog.id).close())
    );
  }


  private setFormValues(template: ListingTemplate) {
    this.saveButtonText = TextContent.BUTTON_LABEL_UPDATE;
    this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_EXISTING;

    this.templateForm.controls['title'].setValue(
      typeof template.information.title === 'string' ? template.information.title : ''
    );
    this.templateForm.controls['shortDescription'].setValue(
      typeof template.information.summary === 'string' ? template.information.summary : ''
    );
    this.templateForm.controls['longDescription'].setValue(
      typeof template.information.description === 'string' ? template.information.description : ''
    );
    this.templateForm.controls['basePrice'].setValue(template.price.basePrice.particls());
    this.templateForm.controls['priceShipLocal'].setValue(template.price.shippingLocal.particls());
    this.templateForm.controls['priceShipIntl'].setValue(template.price.shippingInternational.particls());
    this.templateForm.controls['sourceRegion'].setValue(
      typeof template.location.countryCode === 'string' ? template.location.countryCode : ''
    );
    this.templateForm.controls['targetRegions'].setValue(
      Object.prototype.toString.call(template.shippingDestinations) === '[object Array]' ?
        template.shippingDestinations.map(dest => dest.countryCode) : []
    );

    const savedImages = (template.images || []).map(image => {
      const imgVer = image.versions.find(version => version.version === 'THUMBNAIL');
      if (imgVer) {
        return {id: image.id, url: imgVer.url};
      }
    }).filter(img => !!(img && img.id && img.url));
    this.templateForm.controls['images'].setValue(savedImages);
  }
}
