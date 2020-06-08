import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, of, defer, iif, throwError } from 'rxjs';
import { take, map, concatMap, tap, finalize, mapTo, catchError, last } from 'rxjs/operators';
import { RegionListService } from '../../services/region-list/region-list.service';
import { SellService } from '../sell.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { SellTemplateFormComponent } from '../sell-template-form/sell-template-form.component';
import { Country } from '../../services/data/data.models';
import { BaseTemplate, MarketTemplate } from '../sell.models';
import { PublishTemplateModalComponent } from './publish-template-modal/publish-template-modal.component';
import { RespTemplateSize } from 'app/main-market/shared/market.models';


enum TextContent {
  BUTTON_LABEL_SAVE = 'Save',
  BUTTON_LABEL_UPDATE = 'Update',
  BUTTON_LABEL_PUBLISH_NEW = 'Save and Publish',
  BUTTON_LABEL_PUBLISH_EXISTING = 'Update and Publish',
  ERROR_UNEDITABLE = 'template cannot be edited',
  ERROR_EXISTING_TEMPLATE_FETCH = 'Could not find the saved template, please try again',
  ERROR_MAX_SIZE = 'maximum listing size exceeded - try to reduce image or text sizes',
  ERROR_FAILED_SAVE = 'Could not save the changes to the template',
  ERROR_IMAGE_REMOVAL = 'Could not remove the selected image',
  IMAGE_SELECTION_FAILED = 'One or more images selected were not valid',
  PROCESSING_TEMPLATE_SAVE = 'Saving the current changes',
  PROCESSING_TEMPLATE_PUBLISH = 'Publishing the template to the selected market',
  PUBLISH_FAILED = 'Failed to publish the template',
  PUBLISH_SUCCESS = 'Successfully created a listing!'
}


@Component({
  templateUrl: './new-listing.component.html',
  styleUrls: ['./new-listing.component.scss']
})
export class NewListingComponent implements OnInit, OnDestroy {

  errorMessage: string = '';
  saveButtonText: string = '';
  publishButtonText: string = '';

  readonly regionList$: BehaviorSubject<Country[]> = new BehaviorSubject([]);

  @ViewChild(SellTemplateFormComponent, {static: false}) private templateForm: SellTemplateFormComponent;

  private hasLoaded: boolean = false;
  private isValid: boolean = false;
  private isTemplateEditable: boolean = false;
  private savedTempl: BaseTemplate | MarketTemplate = null;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _regionService: RegionListService,
    private _sellService: SellService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _unlocker: WalletEncryptionService,
  ) { }


  ngOnInit() {

    const regions$ = defer(() => {
      const regions = this._regionService.getCountryList().map(c => ({id: c.iso, name: c.name}));
      this.regionList$.next(regions);
    });

    this._route.queryParams.pipe(
      take(1),
      map(params => +params['templateID']),
      concatMap((id: number) => {
        return this.loadTemplate(id).pipe(
          tap(() => this.hasLoaded = true),
          tap((templ) => {
            this.savedTempl = templ;
            this.isTemplateEditable = templ.hash.length > 0;
            this.errorMessage = TextContent.ERROR_UNEDITABLE;
          }),
          concatMap(() => iif(() => this.regionList$.value.length === 0, regions$)),
        );
      }),
    ).subscribe(
      null,
      (err) => this.errorMessage = TextContent.ERROR_EXISTING_TEMPLATE_FETCH
    );
  }


  ngOnDestroy() {
    this.regionList$.complete();
  }


  get isFormReady(): boolean {
    return this.hasLoaded;
  }

  get canActionForm(): boolean {
    return this.isValid;
  }

  get savedTemplate(): BaseTemplate | MarketTemplate | null {
    return this.savedTempl;
  }


  updateFormValidity(valid: boolean): void {
    this.isValid = valid;
  }


  actionImageAddError(): void {
    this._snackbar.open(TextContent.IMAGE_SELECTION_FAILED, 'err');
  }


  actionImageRemovalRequest(imageId: number): void {
    if (!this.isTemplateEditable) {
      return;
    }
    // this._sellService.removeTemplateImage(+imageId).pipe(
    //   tap(() => {
    //     if (this.errorMessage === TextContent.ERROR_MAX_SIZE) {
    //       this.errorMessage = '';
    //     }
    //   })
    // ).subscribe(
    //   null,
    //   () => this._snackbar.open(TextContent.ERROR_IMAGE_REMOVAL)
    // );
  }


  saveTemplate() {
    if (!this.canActionForm) {
      return;
    }

    // this.doTemplateSave().subscribe();
  }


  publishTemplate() {
    if (!this.canActionForm) {
      return;
    }

    // this.doTemplateSave().pipe(
    //   last()
    // ).subscribe(
    //   () => {
    //     const dialog = this._dialog.open(
    //       PublishTemplateModalComponent,
    //       {data: {templateID: this.savedTempl.id}}
    //     );
    //     dialog.componentInstance.isConfirmed.pipe(
    //       take(1),
    //       concatMap((resp) => this._unlocker.unlock({timeout: 20}).pipe(
    //         concatMap((unlocked) => {
    //           const publish$ = defer(() => {
    //             this._dialog.open(ProcessingModalComponent, {
    //               disableClose: true,
    //               data: { message: TextContent.PROCESSING_TEMPLATE_PUBLISH }
    //             });

    //             return this._sellService.publishTemplate(this.savedTempl.id, resp.market, resp.duration, null, false).pipe(
    //               finalize(() => this._dialog.closeAll())
    //             );
    //           });
    //           return iif(() => unlocked, publish$);
    //         })
    //       ))
    //     ).subscribe(
    //       () => {
    //         this._snackbar.open(TextContent.PUBLISH_SUCCESS);
    //         this._router.navigate(['../'], {relativeTo: this._route, queryParams: {selectedSellTab: 'templates'}});
    //       },
    //       () => {
    //         this._snackbar.open(TextContent.PUBLISH_FAILED, 'err');
    //       }
    //     );

    //     dialog.afterClosed().pipe(take(1)).subscribe(() => dialog.componentInstance.isConfirmed.unsubscribe());
    //   }
    // );
  }


  // private doTemplateSave(): Observable<BaseTemplate | MarketTemplate> {
  //   const dialog = this._dialog.open(ProcessingModalComponent, {
  //     disableClose: true,
  //     data: { message: TextContent.PROCESSING_TEMPLATE_SAVE }
  //   });

  //   let update$: Observable<number>;

  //   const formValues = this.templateForm.getFormValues();

  //   const parsedValues = {
  //     title: typeof formValues['title'] === 'string' ? formValues['title'] : '',
  //     summary: typeof formValues['summary'] === 'string' ? formValues['summary'] : '',
  //     description: typeof formValues['description'] === 'string' ? formValues['description'] : '',
  //     basePrice: (typeof formValues['basePrice'] === 'string') && (+formValues['basePrice'] >= 0) ?
  //         formValues['basePrice'] : '0',
  //     domesticShippingPrice: (typeof formValues['priceShipLocal'] === 'string') && (+formValues['priceShipLocal'] >= 0) ?
  //         formValues['priceShipLocal'] : '0',
  //     foreignShippingPrice: (typeof formValues['priceShipIntl'] === 'string') && (+formValues['priceShipIntl'] >= 0) ?
  //         formValues['priceShipIntl'] : '0',
  //     images: Object.prototype.toString.call(formValues['pendingImages']) === '[object Array]' ?
  //         formValues['pendingImages'].map((image: string) => ({type: 'LOCAL', encoding: 'BASE64', data: image})) : [],
  //     shippingFrom: typeof formValues['sourceRegion'] === 'string' ? formValues['sourceRegion'] : '',
  //     shippingTo: Object.prototype.toString.call(formValues['targetRegions']) === '[object Array]' ?
  //         (formValues['targetRegions'] as string[]) : [],
  //   };

  //   if (this.savedTempl === null) {
  //     // perform save
  //     const newTemplateData: NewTemplateData = {
  //       title: parsedValues.title,
  //       shortDescription: parsedValues.shortDescription,
  //       longDescription: parsedValues.longDescription,
  //       basePrice: +parsedValues.basePrice,
  //       domesticShippingPrice: +parsedValues.domesticShippingPrice,
  //       foreignShippingPrice: +parsedValues.foreignShippingPrice,
  //       images: parsedValues.images,
  //       shippingFrom: parsedValues.shippingFrom,
  //       shippingTo: parsedValues.shippingTo,
  //       escrowType: 'MAD_CT',
  //       escrowReleaseType: 'ANON',
  //       escrowBuyerRatio: 100,
  //       escrowSellerRatio: 100,
  //       salesType: 'SALE',
  //       currency: 'PART',
  //     };

  //     update$ = this._sellService.createNewTemplate(newTemplateData);

  //   } else {
  //     // perform update operations
  //     const updateData: UpdateTemplateData = {};
  //     updateData.images = parsedValues.images;

  //     if (
  //       (parsedValues.title !== this.savedTempl.information.title) ||
  //       (parsedValues.shortDescription !== this.savedTempl.information.summary) ||
  //       (parsedValues.longDescription !== this.savedTempl.information.description)
  //     ) {
  //       updateData.info = {
  //         title: parsedValues.title,
  //         shortDescription: parsedValues.shortDescription,
  //         longDescription: parsedValues.longDescription
  //       };
  //     }

  //     if (
  //       (parsedValues.basePrice !== this.savedTempl.price.basePrice.particlsString()) ||
  //       (parsedValues.domesticShippingPrice !== this.savedTempl.price.shippingLocal.particlsString()) ||
  //       (parsedValues.foreignShippingPrice !== this.savedTempl.price.shippingInternational.particlsString())
  //     ) {
  //       updateData.payment = {
  //         basePrice: +parsedValues.basePrice,
  //         domesticShippingPrice: +parsedValues.domesticShippingPrice,
  //         foreignShippingPrice: +parsedValues.foreignShippingPrice,
  //         currency: 'PART',
  //         salesType: 'SALE'
  //       };
  //     }

  //     if (parsedValues.shippingFrom !== this.savedTempl.location.countryCode) {
  //       updateData.shippingFrom = parsedValues.shippingFrom;
  //     }

  //     updateData.shippingTo = {
  //       add: [],
  //       remove: []
  //     };

  //     const existingDestinationCodes = (this.savedTempl.shippingDestinations || []).filter(dest => {
  //       return dest.type === 'SHIPS';
  //     }).map(dest => dest.countryCode);

  //     existingDestinationCodes.forEach(dest => {
  //       if (!parsedValues.shippingTo.includes(dest)) {
  //         updateData.shippingTo.remove.push(dest);
  //       }
  //     });

  //     parsedValues.shippingTo.forEach((dest: string) => {
  //       if (!existingDestinationCodes.includes(dest)) {
  //         updateData.shippingTo.add.push(dest);
  //       }
  //     });

  //     update$ = this._sellService.updateExistingTemplate(this.savedTempl.id, updateData).pipe(mapTo(this.savedTempl.id));
  //   }

  //   return update$.pipe(
  //     concatMap((id: number) => iif(
  //       () => +id > 0,
  //       defer(() => {
  //         // @TODO: zaSmilingIdiot 2020-05-25 -> stupid way to force the update. Do change detection, etc in the capture Form component
  //         this.hasLoaded = false;
  //         return this.loadTemplate(id).pipe(
  //             finalize(() => this.hasLoaded = true),
  //             concatMap((template: ListingTemplate) => {
  //               return this._sellService.getTemplateSize(template.id).pipe(
  //                 catchError(() => of(null)),
  //                 tap((resp: RespTemplateSize | null) => {
  //                   if ((resp === null) || !resp.fits) {
  //                     this.errorMessage = TextContent.ERROR_MAX_SIZE;
  //                   }
  //                 }),
  //                 mapTo(template)
  //               );
  //             })
  //           );
  //         }
  //       )
  //     )),
  //     finalize(() => this._dialog.getDialogById(dialog.id).close()),
  //     catchError(() => {
  //       this._snackbar.open(TextContent.ERROR_FAILED_SAVE);
  //       return throwError('save error');
  //     }),
  //   );

  // }


  private loadTemplate(id: number): Observable<BaseTemplate | MarketTemplate | null> {
    if (id > 0) {
      return this._sellService.fetchTemplate(id).pipe(
        tap(() => {
          this.saveButtonText = TextContent.BUTTON_LABEL_UPDATE;
          this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_EXISTING;
        })
      );
    }
    return of(null).pipe(
      tap(() => {
        this.saveButtonText = TextContent.BUTTON_LABEL_SAVE;
        this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_NEW;
      })
    );
  }
}
