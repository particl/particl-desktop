import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subject, BehaviorSubject, concat } from 'rxjs';
import { map, catchError, takeUntil, tap, concatMap, } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { SellService } from '../sell.service';
import { RegionListService } from '../../services/region-list/region-list.service';
import { DataService } from '../../services/data/data.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { SellTemplateFormComponent } from '../sell-template-form/sell-template-form.component';
import { Template, TemplateFormDetails } from '../sell.models';
import { Market, CategoryItem } from 'app/main-market/services/data/data.models';


enum TextContent {
  BUTTON_LABEL_SAVE = 'Save',
  BUTTON_LABEL_UPDATE = 'Update',
  BUTTON_LABEL_PUBLISH_NEW = 'Save and Publish',
  BUTTON_LABEL_PUBLISH_EXISTING = 'Update and Publish',
  // ERROR_UNEDITABLE = 'template cannot be edited',
  ERROR_EXISTING_TEMPLATE_FETCH = 'Could not find the saved template, please try again',
  // ERROR_MAX_SIZE = 'maximum listing size exceeded - try to reduce image or text sizes',
  // ERROR_FAILED_SAVE = 'Could not save the changes to the template',
  // ERROR_IMAGE_REMOVAL = 'Could not remove the selected image',
  ERROR_IMAGE_ADD = 'One or more images selected were not valid',
  // PROCESSING_TEMPLATE_SAVE = 'Saving the current changes',
  // PROCESSING_TEMPLATE_PUBLISH = 'Publishing the template to the selected market',
  // PUBLISH_FAILED = 'Failed to publish the template',
  // PUBLISH_SUCCESS = 'Successfully created a listing!'
}


@Component({
  templateUrl: './new-listing.component.html',
  styleUrls: ['./new-listing.component.scss']
})
export class NewListingComponent implements OnInit, OnDestroy {

  isNewTemplate: boolean = true;
  errorMessage: string = '';
  saveButtonText: string = '';
  publishButtonText: string = '';
  canActionForm: boolean = false;

  readonly regions$: Observable<{id: string, name: string}[]>;
  readonly markets$: Observable<{id: number, name: string}[]>;
  readonly categories$: Observable<{id: number, name: string}[]>;

  // private hasLoaded: boolean = false;
  // private isValid: boolean = false;

  @ViewChild(SellTemplateFormComponent, {static: false}) private templateForm: SellTemplateFormComponent;

  private destroy$: Subject<void> = new Subject();
  private categoryList$: BehaviorSubject<{id: number; name: string}[]> = new BehaviorSubject([]);
  private marketsList$: BehaviorSubject<{id: number; name: string}[]> = new BehaviorSubject([]);
  private savedTempl: Template = null;
  private profileMarkets: Market[] = [];


  constructor(
    private _route: ActivatedRoute,
    private _store: Store,
    private _regionService: RegionListService,
    private _sharedService: DataService,
    private _snackbar: SnackbarService,
    private _sellService: SellService
  ) {
    const regionsMap = this._regionService.getCountryList().map(c => ({id: c.iso, name: c.name}));
    this.regions$ = of(regionsMap);

    this.categories$ = this.categoryList$.asObservable();
    this.markets$ = this.marketsList$.asObservable();
  }


  ngOnInit() {

    // Load all markets for the current profile
    const marketLoader$ = this._sharedService.loadMarkets().pipe(
      catchError(() => of([] as Market[])),
      tap((markets) => {
        this.profileMarkets = markets;
      })
    );

    // Load and process any requested template
    const reqTemplateId = +this._route.snapshot.queryParamMap.get('templateID');
    const templLoader$ = this.fetchTemplateDetails(reqTemplateId).pipe(
      catchError(() => {
        this.errorMessage = TextContent.ERROR_EXISTING_TEMPLATE_FETCH;
        return of(null as Template);
      }),
      tap(templ => this.resetTemplateDetails(templ))
    );

    // Ensure that the markets are loaded first, since the template processing requires the market list
    const init$ = marketLoader$.pipe(
      concatMap(() => templLoader$)
    );

    // Watch the identity - if it changes, load up the new markets associated with that identity and filter out existing market templates
    const identityMarkets$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((currentId) => {
        let availableMarkets = this.profileMarkets.filter(m => m.identityId === currentId.id);
        if (this.savedTempl) {
          if (this.savedTempl.type === 'BASE') {
            availableMarkets = availableMarkets.filter(m =>
              !this.savedTempl.baseTemplate.marketHashes.includes(m.receiveAddress)
            );
          } else if (this.savedTempl.type === 'MARKET') {
            availableMarkets = availableMarkets.filter(m => m.receiveAddress === this.savedTempl.marketDetails.marketKey);
          }
        }

        this.marketsList$.next(
          availableMarkets.map(m => ({id: m.id, name: m.name}))
        );
      }),
      takeUntil(this.destroy$)
    );

    concat(
      init$,            // this completes (it has to do so)
      identityMarkets$, // this starts after the previous completes, but doesn't complete until component is destroyed
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

  }


  ngOnDestroy() {
    this.marketsList$.complete();
    this.categoryList$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionCategoryChangeForNewMarket(marketId: number): void {
    if (marketId > 0) {
      this.setCategoriesForMarket(marketId).subscribe();
    } else {
      this.categoryList$.next([]);
    }
  }


  actionImageAddError(): void {
    this._snackbar.open(TextContent.ERROR_IMAGE_ADD, 'err');
  }


  updateFormValidity(isValid: boolean): void {
    this.canActionForm = isValid;
  }


  actionImageRemovalRequest(imageId: number) {
  }


  saveTemplate(): void {

  }


  publishTemplate(): void {

  }


  // actionImageRemovalRequest(imageId: number): void {
  //   if (!this.isTemplateEditable) {
  //     return;
  //   }
  //   // this._sellService.removeTemplateImage(+imageId).pipe(
  //   //   tap(() => {
  //   //     if (this.errorMessage === TextContent.ERROR_MAX_SIZE) {
  //   //       this.errorMessage = '';
  //   //     }
  //   //   })
  //   // ).subscribe(
  //   //   null,
  //   //   () => this._snackbar.open(TextContent.ERROR_IMAGE_REMOVAL)
  //   // );
  // }


  // saveTemplate() {
  //   if (!this.canActionForm) {
  //     return;
  //   }

  //   // this.doTemplateSave().subscribe();
  // }


  // publishTemplate() {
  //   if (!this.canActionForm) {
  //     return;
  //   }

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
  // }


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


  private fetchTemplateDetails(id: number): Observable<Template | null> {
    let obs$: Observable<Template> = of(null);
    if (id > 0) {
      obs$ = this._sellService.fetchTemplateForProduct(id);
    }
    return obs$;
  }


  private resetTemplateDetails(templ: Template) {
    this.savedTempl = templ;

    const formDetails: TemplateFormDetails = {
      title: '',
      summary: '',
      description: '',
      priceBase: '',
      priceShipLocal: '',
      priceShipIntl: '',
      savedImages: [],
      shippingOrigin: '',
      shippingDestinations: [],
      category: {
        selectedMarketCategoryId: 0,
        canEdit: true,
      },
      market: {
        selectedMarketId: 0,
        canEdit: true
      }
    };

    if (templ) {
      this.isNewTemplate = false;
      this.saveButtonText = TextContent.BUTTON_LABEL_UPDATE;
      this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_EXISTING;

      formDetails.title = templ.savedDetails.title;
      formDetails.summary = templ.savedDetails.summary;
      formDetails.description = templ.savedDetails.description;
      formDetails.priceBase = templ.savedDetails.priceBase.particlsString();
      formDetails.priceShipLocal = templ.savedDetails.priceShippingLocal.particlsString();
      formDetails.priceShipIntl = templ.savedDetails.priceShippingIntl.particlsString();
      formDetails.savedImages = templ.savedDetails.images;
      formDetails.shippingOrigin = templ.savedDetails.shippingOrigin;
      formDetails.shippingDestinations = templ.savedDetails.shippingDestinations;

      if (templ.marketDetails) {
        formDetails.category.selectedMarketCategoryId = templ.marketDetails.category.id;

        const foundMarket = this.profileMarkets.find(m => m.receiveAddress === templ.marketDetails.marketKey);
        formDetails.market.canEdit = !(templ.marketDetails.marketKey.length > 0);
        if (foundMarket) {
          formDetails.market.selectedMarketId = foundMarket.id;
        }
      }

    } else {
      this.isNewTemplate = true;
      this.saveButtonText = TextContent.BUTTON_LABEL_SAVE;
      this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_NEW;
    }

    this.templateForm.resetFormDetails(formDetails);
  }


  private setCategoriesForMarket(marketId: number): Observable<CategoryItem[]> {
    return this._sharedService.loadCategories(marketId).pipe(
      map(categories => Array.isArray(categories.categories) ? categories.categories : []),
      catchError(() => of([])),
      tap(categories => this.categoryList$.next(categories)),
    );
  }
}
