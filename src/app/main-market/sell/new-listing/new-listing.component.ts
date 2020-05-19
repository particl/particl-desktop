import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, of, defer, iif, throwError } from 'rxjs';
import { take, map, concatMap, tap, finalize, mapTo, catchError, last } from 'rxjs/operators';
import { RegionListService } from '../../services/region-list/region-list.service';
import { SellService } from '../sell.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { amountValidator, totalValueValidator } from './new-listing.validators';
import { Country } from '../../services/data/data.models';
import { NewTemplateData, ListingTemplate, UpdateTemplateData } from '../sell.models';
import { PublishTemplateModalComponent } from './publish-template-modal/publish-template-modal.component';
import { RespTemplateSize } from 'app/main-market/shared/market.models';


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
  PROCESSING_TEMPLATE_SAVE = 'Saving the current changes',
  PROCESSING_TEMPLATE_PUBLISH = 'Publishing the template to the selected market',
  PUBLISH_FAILED = 'Failed to publish the template',
  PUBLISH_SUCCESS = 'Successfully created a listing!'
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

  private listingTemplate: ListingTemplate = null;

  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _regionService: RegionListService,
    private _sellService: SellService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _unlocker: WalletEncryptionService,
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

    this._route.queryParams.pipe(
      take(1),
      map(params => +params['templateID']),
      concatMap((id: number) => {
        let load$ = of(null);
        if (id) {
          load$ = this.loadTemplate(id);
        } else {
          this.saveButtonText = TextContent.BUTTON_LABEL_SAVE;
          this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_NEW;
        }
        return load$.pipe(
          concatMap(() => iif(() => this.regionList$.value.length === 0, regions$)),
        );
      }),
    ).subscribe(
      null,
      (err) => this.errorMessage = TextContent.ERROR_EXISTING_TEMPLATE_FETCH
    );
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

    this.doTemplateSave().subscribe();
  }


  publishTemplate() {
    if (this.templateForm.invalid) {
      return;
    }

    this.doTemplateSave().pipe(
      last()
    ).subscribe(
      () => {
        const dialog = this._dialog.open(
          PublishTemplateModalComponent,
          {data: {templateID: this.listingTemplate.id}}
        );
        dialog.componentInstance.isConfirmed.pipe(
          take(1),
          concatMap((resp) => this._unlocker.unlock({timeout: 20}).pipe(
            concatMap((unlocked) => {
              const publish$ = defer(() => {
                this._dialog.open(ProcessingModalComponent, {
                  disableClose: true,
                  data: { message: TextContent.PROCESSING_TEMPLATE_PUBLISH }
                });

                return this._sellService.publishTemplate(this.listingTemplate.id, resp.market, resp.duration, null, false).pipe(
                  finalize(() => this._dialog.closeAll())
                );
              });
              return iif(() => unlocked, publish$);
            })
          ))
        ).subscribe(
          () => {
            this._snackbar.open(TextContent.PUBLISH_SUCCESS);
            this._router.navigate(['../'], {relativeTo: this._route});
          },
          () => {
            this._snackbar.open(TextContent.PUBLISH_FAILED, 'err');
          }
        );

        dialog.afterClosed().pipe(take(1)).subscribe(() => dialog.componentInstance.isConfirmed.unsubscribe());
      }
    );
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
        if (this.errorMessage === TextContent.ERROR_MAX_SIZE) {
          this.errorMessage = '';
        }
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


  private doTemplateSave(): Observable<ListingTemplate> {

    const dialog = this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: { message: TextContent.PROCESSING_TEMPLATE_SAVE }
    });

    let update$: Observable<number>;

    const controls = this.templateForm.controls;
    const controlKeys = Object.keys(controls);
    for (const field of controlKeys) {
      if (typeof controls[field].value === 'string') {
        controls[field].setValue(controls[field].value.trim());
      }
    }

    if (this.listingTemplate === null) {
      // perform save
      const newTemplateData: NewTemplateData = {
        title: controls['title'].value || '',
        shortDescription: controls['shortDescription'].value || '',
        longDescription: controls['longDescription'].value || '',
        basePrice: +controls['basePrice'].value || 0,
        domesticShippingPrice: +controls['priceShipLocal'].value || 0,
        foreignShippingPrice: +controls['priceShipIntl'].value || 0,
        images: this.imagesPending.value.map((image: string) => ({type: 'LOCAL', encoding: 'BASE64', data: image})),
        shippingFrom: controls['sourceRegion'].value,
        shippingTo: controls['targetRegions'].value,
        escrowType: 'MAD_CT',
        escrowReleaseType: 'ANON',
        escrowBuyerRatio: 100,
        escrowSellerRatio: 100,
        salesType: 'SALE',
        currency: 'PART',
      };

      update$ = this._sellService.createNewTemplate(newTemplateData);
    } else {
      // perform update operations
      const updateData: UpdateTemplateData = {};
      updateData.images = this.imagesPending.value.map(img => ({type: 'LOCAL', encoding: 'BASE64', data: img}));

      if (
        (controls['title'].value !== this.listingTemplate.information.title) ||
        (controls['shortDescription'].value !== this.listingTemplate.information.summary) ||
        (controls['longDescription'].value !== this.listingTemplate.information.description)
      ) {
        updateData.info = {
          title: controls['title'].value,
          shortDescription: controls['shortDescription'].value,
          longDescription: controls['longDescription'].value
        };
      }

      if (
        (controls['basePrice'].value !== this.listingTemplate.price.basePrice.particlsString()) ||
        (controls['priceShipLocal'].value !== this.listingTemplate.price.shippingLocal.particlsString()) ||
        (controls['priceShipIntl'].value !== this.listingTemplate.price.shippingInternational.particlsString())
      ) {
        updateData.payment = {
          basePrice: +controls['basePrice'].value,
          domesticShippingPrice: +controls['priceShipLocal'].value,
          foreignShippingPrice: +controls['priceShipIntl'].value,
          currency: 'PART',
          salesType: 'SALE'
        };
      }

      if (controls['sourceRegion'].value !== this.listingTemplate.location.countryCode) {
        updateData.shippingFrom = controls['sourceRegion'].value;
      }

      updateData.shippingTo = {
        add: [],
        remove: []
      };

      const existingDestinationCodes = (this.listingTemplate.shippingDestinations || []).filter(dest => {
        return dest.type === 'SHIPS';
      }).map(dest => dest.countryCode);

      existingDestinationCodes.forEach(dest => {
        if (!controls['targetRegions'].value.includes(dest)) {
          updateData.shippingTo.remove.push(dest);
        }
      });

      controls['targetRegions'].value.forEach((dest: string) => {
        if (!existingDestinationCodes.includes(dest)) {
          updateData.shippingTo.add.push(dest);
        }
      });

      update$ = this._sellService.updateExistingTemplate(this.listingTemplate.id, updateData).pipe(mapTo(this.listingTemplate.id));
    }

    return update$.pipe(
      concatMap((id: number) => iif(
        () => +id > 0,
        defer(() =>
          this.loadTemplate(id).pipe(
            catchError(() => {
              this._snackbar.open(TextContent.ERROR_FAILED_SAVE);
              return throwError('save error');
            }),
            concatMap((template: ListingTemplate) => {
              return this._sellService.getTemplateSize(template.id).pipe(
                catchError(() => of(null)),
                tap((resp: RespTemplateSize | null) => {
                  if ((resp === null) || !resp.fits) {
                    this.errorMessage = TextContent.ERROR_MAX_SIZE;
                  }
                }),
                mapTo(template)
              );
            })
          )
        )
      )),
      finalize(() => this._dialog.getDialogById(dialog.id).close()),
    );
  }


  private setFormValues(template: ListingTemplate): void {
    this.imagesPending.setValue([]);

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
    this.templateForm.controls['basePrice'].setValue(template.price.basePrice.particlsString());
    this.templateForm.controls['priceShipLocal'].setValue(template.price.shippingLocal.particlsString());
    this.templateForm.controls['priceShipIntl'].setValue(template.price.shippingInternational.particlsString());
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


  private loadTemplate(id: number): Observable<ListingTemplate> {
    if (id) {
      return this._sellService.fetchTemplate(id).pipe(
        tap((template: ListingTemplate) => {
          this.listingTemplate = template;
          this.setFormValues(template);
        })
      );
    }
    return of(null);
  }
}
