import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, BehaviorSubject, merge, iif, defer, combineLatest } from 'rxjs';
import { map, catchError, takeUntil, tap, concatMap, mapTo, take } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { SellService } from '../sell.service';
import { RegionListService } from '../../services/region-list/region-list.service';
import { DataService } from '../../services/data/data.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { SellTemplateFormComponent } from '../sell-template-form/sell-template-form.component';
import { PublishTemplateModalComponent, PublishTemplateModalInputs } from '../modals/publish-template-modal/publish-template-modal.component';
import { getValueOrDefault, isBasicObjectType } from 'app/main-market/shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';

import { Template, TemplateFormDetails, CreateTemplateRequest, TemplateRequestImageItem, UpdateTemplateRequest } from '../sell.models';
import { Market, CategoryItem } from '../../services/data/data.models';
import { ESCROW_RELEASE_TYPE, MarketType } from '../../shared/market.models';
import { Identity } from './../../store/market.models';


enum TextContent {
  BUTTON_LABEL_SAVE = 'Save',
  BUTTON_LABEL_UPDATE = 'Update',
  BUTTON_LABEL_PUBLISH_NEW = 'Save and Publish',
  BUTTON_LABEL_PUBLISH_EXISTING = 'Update and Publish',
  ERROR_EXISTING_TEMPLATE_FETCH = 'Could not find the saved template, please try again',
  ERROR_MAX_TEMPLATE_SIZE = 'maximum listing size exceeded - try to reduce image or text sizes',
  ERROR_FAILED_SAVE = 'Could not save the changes to the template',
  ERROR_IMAGE_REMOVAL = 'Could not remove the selected image',
  ERROR_IMAGE_ADD = 'One or more images selected were not valid',
  ERROR_PUBLISH_TEMPLATE_TYPE = 'This template may not be published',
  PROCESSING_TEMPLATE_SAVE = 'Saving the current changes',
  PROCESSING_TEMPLATE_PUBLISH = 'Publishing the template to the selected market',
  PUBLISH_FAILED = 'Failed to publish the template',
  PUBLISH_FAILED_IMAGES = 'Template published but missing some images',
  PUBLISH_SUCCESS = 'Successfully created a listing!'
}


@Component({
  templateUrl: './new-listing.component.html',
  styleUrls: ['./new-listing.component.scss']
})
export class NewListingComponent implements OnInit, OnDestroy {

  isNewTemplate: boolean = true;
  isTemplatePublishable: boolean = false;
  isTemplateSavable: boolean = false;
  errorMessage: FormControl = new FormControl('');
  saveButtonText: string = '';
  publishButtonText: string = '';

  readonly regions$: Observable<{id: string, name: string}[]>;
  readonly markets$: Observable<{id: number, name: string}[]>;
  readonly categories$: Observable<{id: number, name: string}[]>;


  @ViewChild(SellTemplateFormComponent, {static: false}) private templateForm: SellTemplateFormComponent;

  private destroy$: Subject<void> = new Subject();
  private categoryList$: BehaviorSubject<{id: number; name: string}[]> = new BehaviorSubject([]);
  private marketsList$: BehaviorSubject<{id: number; name: string, marketType: MarketType}[]> = new BehaviorSubject([]);
  private savedTempl: Template = null;
  private profileMarkets: Market[] = [];
  private isFormValid: boolean = false;
  private processingChangesControl: FormControl = new FormControl(false);
  private selectedMarketId: number = 0;  // track which marketId is selected (if any) for determining publish action availability


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _regionService: RegionListService,
    private _sharedService: DataService,
    private _snackbar: SnackbarService,
    private _sellService: SellService,
    private _unlocker: WalletEncryptionService,
    private _dialog: MatDialog
  ) {
    const regionsMap = this._regionService.getCountryList().map(c => ({id: c.iso, name: c.name}));
    this.regions$ = of(regionsMap);

    this.categories$ = this.categoryList$.asObservable();
    this.markets$ = this.marketsList$.asObservable();
  }


  ngOnInit() {

    const reqTemplateId = +this._route.snapshot.queryParamMap.get('templateID');

    const listener$ = combineLatest([
      this._store.select(MarketState.currentIdentity).pipe(takeUntil(this.destroy$)),

      this._sharedService.loadMarkets().pipe(
        catchError(() => of([] as Market[])),
        tap((markets) => {
          this.profileMarkets = markets;
        }),
        concatMap(() => this.fetchTemplateDetails(reqTemplateId).pipe(
          catchError(() => {
            this.errorMessage.setValue(TextContent.ERROR_EXISTING_TEMPLATE_FETCH);
            return of(null as Template);
          })
        ))
      )

    ]).pipe(
      tap((values: [Identity, Template]) => {

        const currentId = values[0];
        const template = values[1];

        // Extract markets used/needed by the (incoming) template
        let availableMarkets = currentId.markets;
        if (template) {
          if (template.type === 'BASE') {
            availableMarkets = availableMarkets.filter(m =>
              !template.baseTemplate.marketHashes.includes(m.receiveAddress) &&
              (m.type === MarketType.MARKETPLACE || m.type === MarketType.STOREFRONT_ADMIN)
            );
          } else if (template.type === 'MARKET') {
            availableMarkets = this.profileMarkets.filter(m => m.receiveAddress === template.marketDetails.marketKey);
          }
        } else {
          // null template, so basically a base template
          availableMarkets = availableMarkets.filter(m =>
            (m.type === MarketType.MARKETPLACE || m.type === MarketType.STOREFRONT_ADMIN)
          );
        }

        this.marketsList$.next(
          availableMarkets.map(m => ({id: m.id, name: m.name, marketType: m.type, image: m.image}))
        );
      }),

      map((values: [Identity, Template]) => values[1]),

      concatMap((templ) => iif(
        // Hacky, yucky check (but works for now):
        // Resets the template form details if this is the first time we've entered this function call
        () => this.saveButtonText === '',

        defer(() => {
          this.resetTemplateDetails(templ);
          return this.verifyTemplateFits();
        }),

        defer(() => of(true))
      )),

      takeUntil(this.destroy$)
    );


    const processingForm$ = this.processingChangesControl.valueChanges.pipe(

      tap((processingValue) => {
        if (processingValue > 0) {
          let message = TextContent.PROCESSING_TEMPLATE_SAVE;

          if (processingValue === 2) {
            message = TextContent.PROCESSING_TEMPLATE_PUBLISH;
          }
          this._dialog.open(ProcessingModalComponent, {
            disableClose: true,
            data: { message }
          });
        } else if (this._dialog.openDialogs.length) {
          this._dialog.closeAll();
        }
      }),
      takeUntil(this.destroy$)
    );

    const errors$ = this.errorMessage.valueChanges.pipe(
      tap(() => this.updateFormActions()),
      takeUntil(this.destroy$)
    );

    merge(
      listener$,
      processingForm$,
      errors$
    ).subscribe();

  }


  ngOnDestroy() {
    this.marketsList$.complete();
    this.categoryList$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionMarketSelectionChanged(marketId: number): void {
    this.selectedMarketId = +marketId > 0 ? +marketId : 0;
    this.updateFormActions();

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
    this.isFormValid = isValid;
    this.updateFormActions();
  }


  actionImageRemovalRequest(imageId: number) {
    if (!this.savedTempl) {
      return;
    }

    const imgIdx = this.savedTempl.savedDetails.images.findIndex(i => i.id === imageId);
    if (imgIdx === -1) {
      return;
    }

    this._sellService.removeTemplateImage(imageId).pipe(
      tap(() => {
        if (this.errorMessage.value === TextContent.ERROR_MAX_TEMPLATE_SIZE) {
          this.errorMessage.setValue('');
        }
      })
    ).subscribe(
      (success) => {
        if (!success) {
          this._snackbar.open(TextContent.ERROR_IMAGE_REMOVAL, 'warn');
          return;
        }

        // ensure consistency in the current data structure
        this.savedTempl.savedDetails.images = this.savedTempl.savedDetails.images.filter(i => i.id !== imageId);
      }
    );
  }


  saveTemplate(): void {
    if (!this.isTemplateSavable) {
      return;
    }

    this.doTemplateSave().pipe(
      concatMap((success) => iif(
        () => success && (this.savedTempl.type === 'MARKET'),
        defer(() => this.verifyTemplateFits().pipe(mapTo(success))),
        defer(() => of(success))
      ))
    ).subscribe(
      (success) => {
        if (!success) {
          this._snackbar.open(TextContent.ERROR_FAILED_SAVE, 'warn');
        }
      }
    );
  }


  publishTemplate(): void {
    if (!this.isTemplatePublishable) {
      return;
    }

    this.doTemplateSave().pipe(
      concatMap((success) => iif(
        () => success,
        defer(() => this.verifyTemplateFits().pipe(mapTo(success))),
        defer(() => of(success))
      ))
    ).subscribe(
      (success) => {
        if (!success) {
          this._snackbar.open(TextContent.ERROR_FAILED_SAVE, 'warn');
          return;
        }

        if (!this.isTemplatePublishable) {
          return;
        }

        if (!isBasicObjectType(this.savedTempl.marketDetails) || !this.savedTempl.marketDetails.marketKey) {
          this._snackbar.open(TextContent.ERROR_PUBLISH_TEMPLATE_TYPE, 'warn');
          return;
        }

        const selectedMarket = this.profileMarkets.filter(m => m.receiveAddress === this.savedTempl.marketDetails.marketKey);
        if (!selectedMarket.length) {
          this._snackbar.open(TextContent.ERROR_PUBLISH_TEMPLATE_TYPE, 'warn');
          return;
        }

        const openDialog$ = defer(() => {
          const modalData: PublishTemplateModalInputs = {
            templateID: this.savedTempl.id,
            title: this.savedTempl.savedDetails.title,
            marketName: selectedMarket[0].name,
            marketImage: selectedMarket[0].image,
            categoryName: this.savedTempl.marketDetails.category.name
          };

          if (this.savedTempl.savedDetails.images[0]) {
            modalData.templateImage = this.savedTempl.savedDetails.images[0].url;
          }

          const dialog = this._dialog.open(
            PublishTemplateModalComponent,
            {data: modalData}
          );

          return dialog.afterClosed().pipe(
            take(1),
            concatMap((details: {duration: number} | null) => iif(
                () => isBasicObjectType(details) && (+details.duration > 0),

                defer(() => this._unlocker.unlock({timeout: 15}).pipe(
                  concatMap((unlocked) => iif(

                    () => unlocked,

                    defer(() => {
                      this.processingChangesControl.setValue(2);
                      return this._sellService.publishMarketTemplate(this.savedTempl.id, +details.duration).pipe(
                        tap(isSuccess => {
                          if (!isSuccess) {
                            throw new Error('Publish Failed');
                          }
                        }),
                        catchError(err => {
                          let errMsg = TextContent.PUBLISH_FAILED;
                          if (err && (typeof err.message === 'string')) {
                            switch (true) {
                              case err.message.includes('images'): errMsg = TextContent.PUBLISH_FAILED_IMAGES; break;
                            }
                          }
                          this._snackbar.open(errMsg, 'warn');
                          return of(false);
                        }),
                        tap((isSuccess) => {
                          this.processingChangesControl.setValue(0);

                          if (isSuccess) {
                            this._snackbar.open(TextContent.PUBLISH_SUCCESS);
                            this._router.navigate(['../'], {relativeTo: this._route, queryParams: {selectedSellTab: 'templates'}});
                          }
                        })
                      );
                    })
                  ))
                ))
            ))
          );

        });

        this._unlocker.unlock({timeout: 30}).pipe(
          concatMap(isUnlocked => iif(() => isUnlocked, openDialog$))
        ).subscribe();
      }
    );
  }


  private doTemplateSave(): Observable<boolean> {
    this.processingChangesControl.setValue(1);

    const formValues = this.templateForm.getFormValues();

    const parsedBasePrice = getValueOrDefault(formValues['basePrice'], 'string', '');
    const parsedShipLocalPrice = getValueOrDefault(formValues['priceShipLocal'], 'string', '');
    const parsedShpIntlPrice = getValueOrDefault(formValues['priceShipIntl'], 'string', '');

    const parsedValues = {
      title: getValueOrDefault(formValues['title'], 'string', ''),
      summary: getValueOrDefault(formValues['summary'], 'string', ''),
      description: getValueOrDefault(formValues['description'], 'string', ''),
      productCode: getValueOrDefault(formValues['productCode'], 'string', ''),
      basePrice: +parsedBasePrice > 0 ? parsedBasePrice : '0',
      domesticShippingPrice: +parsedShipLocalPrice > 0 ? parsedShipLocalPrice : '0',
      foreignShippingPrice: +parsedShpIntlPrice > 0 ? parsedShpIntlPrice : '0',
      escrowPercentageBuyer: +formValues['escrowPercentageBuyer'] >= 0 ?
        +formValues['escrowPercentageBuyer'] : this._sellService.ESCROW_PERCENTAGE_DEFAULT,
      escrowPercentageSeller: +formValues['escrowPercentageSeller'] >= 0 ?
        +formValues['escrowPercentageSeller'] : this._sellService.ESCROW_PERCENTAGE_DEFAULT,
      escrowRelease: getValueOrDefault(formValues['escrowRelease'], 'string', ESCROW_RELEASE_TYPE.ANON),
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

    let updateObs$: Observable<Template>;
    let responseObs$: Observable<boolean>;


    if ((this.savedTempl === null) || (this.savedTempl.id <= 0)) {
      // Creation of new template
      const newTemplateData: CreateTemplateRequest = {
        title: parsedValues.title,
        summary: parsedValues.summary,
        description: parsedValues.description,
        productCode: parsedValues.productCode ? parsedValues.productCode : undefined,
        images: parsedValues.images,
        priceBase: (new PartoshiAmount(+parsedValues.basePrice)).partoshis(),
        priceShippingLocal: (new PartoshiAmount(+parsedValues.domesticShippingPrice)).partoshis(),
        priceShippingIntl: (new PartoshiAmount(+parsedValues.foreignShippingPrice)).partoshis(),
        shippingFrom: parsedValues.shippingFrom,
        shippingTo: parsedValues.shippingTo,
        escrowType: 'MAD_CT',
        escrowReleaseType: parsedValues.escrowRelease,
        escrowBuyerRatio: parsedValues.escrowPercentageBuyer,
        escrowSellerRatio: parsedValues.escrowPercentageSeller,
        salesType: 'SALE',
        currency: 'PART',
        marketId: parsedValues.selectedMarketId,
        categoryId: parsedValues.selectedCategoryId
      };

      updateObs$ = this._sellService.createNewTemplate(newTemplateData);

    } else {

      // Update existing template (beware base templates that need to be cloned to a market template)

      const updateTemplateData: UpdateTemplateRequest = {};

      if (
        (parsedValues.title !== this.savedTempl.savedDetails.title) ||
        (parsedValues.summary !== this.savedTempl.savedDetails.summary) ||
        (parsedValues.description !== this.savedTempl.savedDetails.description) ||
        ((this.savedTempl.type === 'MARKET') && (this.savedTempl.marketDetails.category.id !== parsedValues.selectedCategoryId)) ||
        (parsedValues.productCode !== this.savedTempl.savedDetails.productCode)
      ) {
        updateTemplateData.info = {
          title: parsedValues.title,
          summary: parsedValues.summary,
          description: parsedValues.description,
          productCode: parsedValues.productCode ? parsedValues.productCode : undefined,
        };

        if (this.savedTempl.type === 'MARKET') {
          updateTemplateData.info.category = parsedValues.selectedCategoryId;
          updateTemplateData.info.productCode = undefined;
        }
      }

      if (parsedValues.images.length) {
        updateTemplateData.images = parsedValues.images;
      }

      if (
        (parsedValues.basePrice !== this.savedTempl.savedDetails.priceBase.particlsString()) ||
        (parsedValues.domesticShippingPrice !== this.savedTempl.savedDetails.priceShippingLocal.particlsString()) ||
        (parsedValues.foreignShippingPrice !== this.savedTempl.savedDetails.priceShippingIntl.particlsString())
      ) {
        updateTemplateData.payment = {
          basePrice: (new PartoshiAmount(+parsedValues.basePrice)).partoshis(),
          domesticShippingPrice: (new PartoshiAmount(+parsedValues.domesticShippingPrice)).partoshis(),
          foreignShippingPrice: (new PartoshiAmount(+parsedValues.foreignShippingPrice)).partoshis(),
          currency: 'PART',
          salesType: 'SALE'
        };
      }

      if (
        (parsedValues.escrowPercentageBuyer !== this.savedTempl.savedDetails.escrowBuyer) ||
        (parsedValues.escrowPercentageSeller !== this.savedTempl.savedDetails.escrowSeller) ||
        (parsedValues.escrowRelease !== this.savedTempl.savedDetails.escrowReleaseType)
      ) {
        updateTemplateData.escrow = {
          buyerRatio: parsedValues.escrowPercentageBuyer,
          sellerRatio: parsedValues.escrowPercentageSeller,
          escrowType: 'MAD_CT',
          releaseType: parsedValues.escrowRelease,
        };
      }

      if (parsedValues.shippingFrom !== this.savedTempl.savedDetails.shippingOrigin) {
        updateTemplateData.shippingFrom = parsedValues.shippingFrom;
      }

      const destRemovals: string[] = [];
      const destAdditions: string[] = [];

      const existingDestinationCodes = (this.savedTempl.savedDetails.shippingDestinations || []);

      existingDestinationCodes.forEach((dest: string) => {
        if (!parsedValues.shippingTo.includes(dest)) {
          destRemovals.push(dest);
        }
      });

      parsedValues.shippingTo.forEach((dest: string) => {
        if (!existingDestinationCodes.includes(dest)) {
          destAdditions.push(dest);
        }
      });

      if (destRemovals.length || destAdditions.length) {
        updateTemplateData.shippingTo = {
          add: destAdditions,
          remove: destRemovals
        };
      }

      if ((this.savedTempl.type === 'BASE') && (parsedValues.selectedMarketId > 0)) {
        updateTemplateData.cloneToMarket = {
          marketId: parsedValues.selectedMarketId,
          categoryId: parsedValues.selectedCategoryId
        };
      }

      if (Object.keys(updateTemplateData).length > 0) {
        updateObs$ = this._sellService.updateExistingTemplate(this.savedTempl.id, updateTemplateData);
      } else {
        responseObs$ = of(true);
      }
    }

    if (updateObs$ !== undefined) {
      responseObs$ = updateObs$.pipe(
        tap((updatedTemp) => this.resetTemplateDetails(updatedTemp)),
        mapTo(true),
        catchError(() => of(false))
      );
    }

    if (responseObs$ === undefined) {
      responseObs$ = of(false);
    }

    return responseObs$.pipe(
      tap(() => this.processingChangesControl.setValue(0))
    );
  }


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
      productCode: '',
      priceBase: '',
      priceShipLocal: '',
      priceShipIntl: '',
      escrowPercentageBuyer: this._sellService.ESCROW_PERCENTAGE_DEFAULT,
      escrowPercentageSeller: this._sellService.ESCROW_PERCENTAGE_DEFAULT,
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
      formDetails.productCode = templ.savedDetails.productCode;
      formDetails.priceBase = templ.savedDetails.priceBase.particlsString();
      formDetails.priceShipLocal = templ.savedDetails.priceShippingLocal.particlsString();
      formDetails.priceShipIntl = templ.savedDetails.priceShippingIntl.particlsString();
      formDetails.savedImages = templ.savedDetails.images;
      formDetails.shippingOrigin = templ.savedDetails.shippingOrigin;
      formDetails.shippingDestinations = templ.savedDetails.shippingDestinations;
      formDetails.escrowPercentageBuyer = templ.savedDetails.escrowBuyer;
      formDetails.escrowPercentageSeller = templ.savedDetails.escrowSeller;

      if (templ.marketDetails) {
        formDetails.category.selectedMarketCategoryId = templ.marketDetails.category.id;

        formDetails.market.canEdit = !(templ.marketDetails.marketKey.length > 0);
        const foundMarket = this.profileMarkets.find(m => m.receiveAddress === templ.marketDetails.marketKey);
        if (foundMarket) {
          formDetails.market.selectedMarketId = foundMarket.id;
        }
        this.selectedMarketId = formDetails.market.selectedMarketId;
      }

    } else {
      this.isNewTemplate = true;
      this.saveButtonText = TextContent.BUTTON_LABEL_SAVE;
      this.publishButtonText = TextContent.BUTTON_LABEL_PUBLISH_NEW;
    }

    this.templateForm.resetFormDetails(formDetails);
  }


  private verifyTemplateFits(): Observable<boolean> {
    return of({}).pipe(
      concatMap(() => iif(
        () => !this.savedTempl || ( this.savedTempl.type !== 'MARKET'),

        defer(() => of(true)),

        defer(() => this._sellService.calculateTemplateFits(this.savedTempl.id).pipe(
          tap(doesFit => {
            if (!doesFit) {
              this.errorMessage.setValue(TextContent.ERROR_MAX_TEMPLATE_SIZE);
              this.updateFormActions();
            }
          })
        )),
      ))
    );
  }


  private setCategoriesForMarket(marketId: number): Observable<CategoryItem[]> {
    return defer(() => {

      // To get the complete list of MARKETPLACE market categories we should NOT pass in a market id to the category search
      let searchedMId: number = undefined;
      const market = this.marketsList$.value.find(m => m.id === marketId);

      if ((market !== undefined) && (market.marketType !== MarketType.MARKETPLACE)) {
        searchedMId = marketId;
      }

      return this._sharedService.loadCategories(searchedMId).pipe(
        map(categories => Array.isArray(categories.categories) ? categories.categories : []),
        catchError(() => of([])),
        tap(categories => this.categoryList$.next(categories)),
      );
    });
  }


  private updateFormActions(): void {
    this.isTemplateSavable = this.isFormValid;
    this.isTemplatePublishable = this.isTemplateSavable &&
        (this.errorMessage.value.length === 0) &&
        (this.selectedMarketId > 0) &&
        (this.marketsList$.value.find(m => m.id === this.selectedMarketId) !== undefined);
  }
}
