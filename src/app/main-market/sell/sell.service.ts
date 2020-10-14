import { Injectable } from '@angular/core';
import { Observable, of, throwError, from } from 'rxjs';
import { concatMap, mapTo, catchError, last, concatAll, map } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { DataService } from '../services/data/data.service';
import { RegionListService } from '../services/region-list/region-list.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../shared/utils';
import { RespListingTemplate, RespItemPost, RespTemplateSize, IMAGE_SEND_TYPE } from '../shared/market.models';
import {
  Template,
  TemplateSavedDetails,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ProductItem,
  ProductMarketTemplate,
  TEMPLATE_STATUS_TYPE } from './sell.models';
import { ListingItemDetail } from '../shared/listing-detail-modal/listing-detail.models';


@Injectable()
export class SellService {


  readonly IMAGE_MAX_SIZE: number;

  private readonly IMAGE_SCALING_FACTOR: number = 0.8;
  private readonly IMAGE_QUALITY_FACTOR: number = 1;
  private readonly IMAGE_ITERATIONS: number = 50;


  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _sharedService: DataService,
    private _regionService: RegionListService
  ) {
    const defaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    this.IMAGE_MAX_SIZE = marketSettings.usePaidMsgForImages ? defaultConfig.imageMaxSizePaid : defaultConfig.imageMaxSizeFree;
  }


  fetchAllProductTemplates(): Observable<ProductItem[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('template', ['search', 0, 1_000_000, 'DESC', 'created_at', profileId]).pipe(
      map((resp: RespListingTemplate[]) => {
        return Array.isArray(resp) ? this.buildProductsFromTemplateList(resp) : [];
      })
    );
  }


  fetchTemplateForProduct(productId: number): Observable<Template> {
    return this.fetchProductTemplate(productId).pipe(
      concatMap((resp) => this.buildTemplateForProduct(resp))
    );
  }


  removeTemplateImage(imageID: number): Observable<boolean> {
    return this._rpc.call('template', ['image', 'remove', imageID]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  cloneTemplateAsBaseProduct(templateId: number): Observable<ProductItem | null> {
    return this.cloneTemplate(templateId).pipe(
      map((resp: RespListingTemplate) => this.buildProductsFromTemplateList([resp])),
      map((productItems: ProductItem[]) => Array.isArray(productItems) && isBasicObjectType(productItems[0]) ? productItems[0] : null)
    );
  }


  cloneTemplateAsMarketTemplate(templateId: number, marketId: number, categoryId: number): Observable<ProductMarketTemplate | null> {
    return this.cloneTemplate(templateId, marketId).pipe(
      concatMap((clonedTemplSrc) => {

        const newInfo = {};

        if (isBasicObjectType(clonedTemplSrc) && (+clonedTemplSrc.id > 0)) {
          if (isBasicObjectType(clonedTemplSrc.ItemInformation)) {
            newInfo['title'] = getValueOrDefault(clonedTemplSrc.ItemInformation.title, 'string', '');
            newInfo['summary'] = getValueOrDefault(clonedTemplSrc.ItemInformation.shortDescription, 'string', '');
            newInfo['description'] = getValueOrDefault(clonedTemplSrc.ItemInformation.longDescription, 'string', '');
          }
        }

        if (Object.keys(newInfo).length === 0) {
          return throwError('Invalid Cloned Template');
        }

        return from([
          this._rpc.call('information', [
            'update',
            +clonedTemplSrc.id,
            newInfo['title'],
            newInfo['summary'],
            newInfo['description'],
            +categoryId
          ]),

          this._rpc.call('template', ['get', +clonedTemplSrc.id])
        ]).pipe(
          concatAll(),
          last(),
          map((resp: RespListingTemplate) => {
            const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
            const defaultImagePath = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
            const marketTempl = this.buildBasicProductMarketItem(resp, marketUrl, defaultImagePath);
            return marketTempl.id > 0 ? marketTempl : null;
          }),
        );
      }),
    );
  }


  calculateTemplateFits(templateId: number): Observable<boolean> {
    return this._rpc.call('template', ['size', templateId]).pipe(
      map((resp: RespTemplateSize) => {
        return isBasicObjectType(resp) && !!resp.fits;
      }),
      catchError(() => of(true))  /// unrelated issues, such as not having a category set, can result in errors being thrown
    );
  }


  createNewTemplate(data: CreateTemplateRequest): Observable<Template> {
    /**
     *
     * - save the current as a base template (because it is a new template)
     * - if a market id has been set then:
     *     = clone the saved template (the newly created one) as a market template
     *     = set the category id appropriately on the new market template
     * - build up a Template object from whichever template was last saved
     *   (either the market template or the base one if no market template was created)
     */

    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    const usePaidImageMsg = this._store.selectSnapshot(MarketState.settings).usePaidMsgForImages;

    const addParams = [
      'add',
      profileId,
      data.title,
      data.summary,
      data.description,
      null,  // category id is not provided here yet (not set here yet)
      data.salesType,
      data.currency,
      data.priceBase,
      data.priceShippingLocal,
      data.priceShippingIntl,
      data.escrowType,
      data.escrowBuyerRatio,
      data.escrowSellerRatio,
      data.escrowReleaseType
    ];

    return this._rpc.call('template', addParams).pipe(
      concatMap(resp => {
        const templateID = resp.id;

        const queries = [];
        queries.push(
          this._rpc.call('template', ['location', 'update', templateID, data.shippingFrom]).pipe(catchError(() => of(null)))
        );

        (data.shippingTo || []).forEach((dest: string) => {
          queries.push(
            this._rpc.call('template', ['shipping', 'add', templateID, dest, 'SHIPS']).pipe(catchError(() => of(null)))
          );
        });

        (data.images || []).forEach(image => {
          const imageParts = image.data.split(',');
          const imgData = imageParts.length === 2 ? imageParts[1] : image.data;
          queries.push(
            this._rpc.call('image', [
              'add',
              'template',
              templateID,
              image.type,
              imgData,
              false,
              false,
              usePaidImageMsg ? IMAGE_SEND_TYPE.PAID : IMAGE_SEND_TYPE.FREE,
              this.IMAGE_SCALING_FACTOR,
              this.IMAGE_QUALITY_FACTOR,
              this.IMAGE_ITERATIONS
            ]).pipe(
              catchError(() => of(null))
            )
          );
        });

        let templateRetrieval$: Observable<RespListingTemplate> = this._rpc.call('template', ['get', templateID]);

        if (+data.marketId > 0) {
          // create a market template clone for this base template
          templateRetrieval$ = this.cloneTemplate(resp.id, +data.marketId).pipe(
            concatMap((newMarketTempl: RespListingTemplate) => {

              if (isBasicObjectType(newMarketTempl) && (+newMarketTempl.id > 0)) {
                // set the category now (since the market is now set)
                return this._rpc.call(
                  'information',
                  ['update', +newMarketTempl.id, data.title, data.summary, data.description, +data.categoryId]
                ).pipe(
                  // finally, return the latest template details
                  concatMap(() => this._rpc.call('template', ['get', +newMarketTempl.id])),
                  catchError(() => of(null))
                );
              }

              return throwError('invalid market template created!');
            })
          );
        }

        queries.push(
          templateRetrieval$.pipe(
            concatMap((respTemplate: RespListingTemplate) => this.buildTemplateForProduct(respTemplate))
          )
        );

        return from(queries).pipe(
          concatMap((query: Observable<any>) => query)
        );
      }),
      last()
    );

  }


  updateExistingTemplate(templateId: number, details: UpdateTemplateRequest): Observable<Template> {
    /**
     *
     * Update existing template
     *
     * NB!
     * If base template
     *  - if market id is now set
     *    = update base template
     *    = clone base as a market template
     *  - else
     *    = just update base template
     * Else if market template
     *  - just update market template
     */

    const updates$: Observable<any>[] = [];
    const usePaidImageMsg = this._store.selectSnapshot(MarketState.settings).usePaidMsgForImages;

    if (isBasicObjectType(details.info)) {
      const rpc$ = this._rpc.call('template', [
        'information',
        'update',
        templateId,
        details.info.title || '',
        details.info.summary || '',
        details.info.description || '',
        +details.info.category || null
      ]);
      updates$.push(rpc$);
    }
    if (isBasicObjectType(details.payment)) {
      const args = [
        'payment',
        'update',
        templateId,
        details.payment.salesType,
        details.payment.currency,
        details.payment.basePrice,
        details.payment.domesticShippingPrice,
        details.payment.foreignShippingPrice
      ];
      updates$.push(this._rpc.call('template', args));
    }
    if (typeof details.shippingFrom === 'string') {
      updates$.push(this._rpc.call('template', ['location', 'update', templateId, details.shippingFrom]));
    }
    if (isBasicObjectType(details.shippingTo)) {
      if (details.shippingTo.add) {
        details.shippingTo.add.forEach(dest =>
          updates$.push(this._rpc.call('template', ['shipping', 'add', templateId, dest, 'SHIPS']))
        );
      }
      if (details.shippingTo.remove) {
        details.shippingTo.remove.forEach(dest =>
          updates$.push(this._rpc.call('template', ['shipping', 'remove', templateId, dest]))
        );
      }
    }
    if (Array.isArray(details.images)) {
      details.images.forEach(image => {
        const imageParts = image.data.split(',');
        const imgData = imageParts.length === 2 ? imageParts[1] : image.data;
        updates$.push(this._rpc.call('image', ['add',
          'template',
          templateId,
          image.type,
          imgData,
          false,
          false,
          usePaidImageMsg ? IMAGE_SEND_TYPE.PAID : IMAGE_SEND_TYPE.FREE,
          this.IMAGE_SCALING_FACTOR,
          this.IMAGE_QUALITY_FACTOR,
          this.IMAGE_ITERATIONS
        ]));
      });
    }

    if (isBasicObjectType(details.cloneToMarket)) {
      const cloneTempl$ = this.cloneTemplate(templateId, details.cloneToMarket.marketId).pipe(
        concatMap((clonedTemplResp) => {

          if (isBasicObjectType(clonedTemplResp) && (+clonedTemplResp.id > 0)) {

            let title = '',
                summary = '',
                description = '';

            if (isBasicObjectType(details.info)) {
              title = details.info.title;
              summary = details.info.summary;
              description = details.info.description;
            } else if (isBasicObjectType(clonedTemplResp.ItemInformation)) {
              // if the update request did not modify any item info, then try obtain these details from the clone template details
              title = getValueOrDefault(clonedTemplResp.ItemInformation.title, 'string', title);
              summary = getValueOrDefault(clonedTemplResp.ItemInformation.shortDescription, 'string', summary);
              description = getValueOrDefault(clonedTemplResp.ItemInformation.longDescription, 'string', description);
            }

            if (+details.cloneToMarket.categoryId > 0) {
              return this._rpc.call('template', [
                'information',
                'update',
                +clonedTemplResp.id,
                title,
                summary,
                description,
                +details.cloneToMarket.categoryId
              ]).pipe(
                concatMap(() => this.fetchProductTemplate(+clonedTemplResp.id))
              );
            } else {
              return this.fetchProductTemplate(+clonedTemplResp.id);
            }
          }

          return throwError('Invalid Market Template');
        })
      );

      updates$.push(cloneTempl$);

    } else {
      updates$.push(this.fetchProductTemplate(templateId));
    }

    // NB! Ensure template details are the last to be fetched from all branches above!

    return from(updates$).pipe(
      concatAll(),
      last(),
      concatMap((templ: RespListingTemplate) => this.buildTemplateForProduct(templ))
    );
  }


  estimatePublishFee(templateId: number, durationDays: number): Observable<number> {
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    const usingAnonFees = marketSettings.useAnonBalanceForFees;
    const usePaidImageMsg = marketSettings.usePaidMsgForImages;

    const postParams = ['post', templateId, durationDays, true, usePaidImageMsg];

    postParams.push(usingAnonFees ? 'anon' : 'part');

    return this._rpc.call('template', postParams).pipe(
      map((resp: RespItemPost) => {
        if (isBasicObjectType(resp) && (+resp.fee > 0)) {
          return +resp.fee;
        }
        throwError('Invalid market request!');
      })
    );
  }


  publishMarketTemplate(templateId: number, durationDays: number): Observable<boolean> {
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    const usingAnonFees = marketSettings.useAnonBalanceForFees;
    const usePaidImageMsg = marketSettings.usePaidMsgForImages;

    const postParams = ['post', templateId, durationDays, false, usePaidImageMsg];

    postParams.push(usingAnonFees ? 'anon' : 'part');

    return this._rpc.call('template', postParams).pipe(
      map((resp: RespItemPost) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }


  async batchPublishProductToMarket(
    productId: number, market: {id: number, key: string}, categoryId: number, durationDays: number
  ): Promise<boolean> {

    /**
     * One may wonder: WTF do we need both a market id and a market key for?
     *
     * Well, once upon a time there was a magical little database.
     * Anybody happening past the little database, and making the right calling sound, would receive a plan for a great wonder,
     * that would make the caller riches beyond their wildest dreams.
     * Unfortunately, the riches were dependant on exactly where the great wonder was built. Luckily, the plan included
     * the location details as well. Or so it seemed...
     * However, when asking the magical little database to help in creating such a wonder from this magical plan, it wanted the
     * potential builder to be an elightened one, and so expected that the location for this wonder of humanity was provided in a different
     * format. Only the true hero would magically figure out how to get from the cryptic location mentioned to them, to getting the
     * correct location value to give back to the little database.
     *
     * The End
     *
     * NB! If the next of the elightened is about to suggest that the first of the elightened should have known to make another call here to
     * get the conversion map... please understand that the first of the enlightened that build the great wonders actually
     * was truly enlightened and realized that this was nonsensical.
     * Because making such a call for each and every wonder they were tasked with building was a waste and required unnecessary
     * mental energy and processing. Much better to have the kingdom for which they were working (and hopefully already had such a map)
     * to provide this for them instead. No map... no work. It was a tacky solution, if such was the magical database, then such
     * brittle and flaky solutions were acceptable.
     *
     * And yes, my story telling sucks furry balls. Lesson though: consistency is key!
     *
     */

    const productTemplate = await this.fetchProductTemplate(productId).toPromise();
    if (!isBasicObjectType(productTemplate) || (+productTemplate.id !== productId)) {
      throw new Error('Invalid product id: not a product');
    }

    let latestMarketTempl: RespListingTemplate;

    if (Array.isArray(productTemplate.ChildListingItemTemplates)) {
      const baseChild = productTemplate.ChildListingItemTemplates.find(mTempl =>
        isBasicObjectType(mTempl) && (+mTempl.id > 0) && mTempl.market === market.key
      );

      if (baseChild) {

        const currentMarketTempl = await this.fetchProductTemplate(+baseChild.id).toPromise();

        if (!isBasicObjectType(currentMarketTempl) || (+currentMarketTempl.id !== +baseChild.id)) {
          throw new Error('Invalid sourced market template');
        }

        if (Array.isArray(currentMarketTempl.ChildListingItemTemplates) && (currentMarketTempl.ChildListingItemTemplates.length > 0)) {

          const latestChild = currentMarketTempl.ChildListingItemTemplates.filter(basicChild =>
            isBasicObjectType(basicChild) && (+basicChild.id > 0)
          ).sort((a, b) => b.id - a.id)[0];

          if (latestChild) {
            const recentEdited = await this.fetchProductTemplate(+latestChild.id).toPromise();

            if (isBasicObjectType(recentEdited) && (+recentEdited.id === +latestChild.id)) {
              latestMarketTempl = recentEdited;
            }
          }
        } else {
          latestMarketTempl = currentMarketTempl;
        }

        if (latestMarketTempl === undefined) {
          throw new Error('Invalid sourced market template');
        }
      }
    }

    // market template with the relevant marketKey was not found. Need to clone the baseTemplate to create a marketTemplate
    if (latestMarketTempl === undefined) {
      const clonedTempl = await this.cloneTemplate(productId, market.id).toPromise();

      if (!isBasicObjectType(clonedTempl) || !(+clonedTempl.id > 0)) {
        throw new Error('Invalid cloned market template');
      }

      latestMarketTempl = clonedTempl;
    }

    // Check that the latest market template has the specified category id set
    if (!isBasicObjectType(latestMarketTempl.ItemInformation)) {
      throw new Error('Invalid template information');
    }

    if (latestMarketTempl.ItemInformation.itemCategoryId !== categoryId) {
      // IF template hash is set, then clone template since template cannot be modified

      if (getValueOrDefault(latestMarketTempl.hash, 'string', '').length > 0) {

        const clonedTempl = await this.cloneTemplate(+latestMarketTempl.id, market.id).toPromise();

        if (!isBasicObjectType(clonedTempl) || !(+clonedTempl.id > 0)) {
          throw new Error('Invalid cloned market template');
        }

        latestMarketTempl = clonedTempl;
      }

      await this._rpc.call('information', [
        'update',
        +latestMarketTempl.id,
        getValueOrDefault(latestMarketTempl.ItemInformation.title, 'string', ''),
        getValueOrDefault(latestMarketTempl.ItemInformation.shortDescription, 'string', ''),
        getValueOrDefault(latestMarketTempl.ItemInformation.longDescription, 'string', ''),
        categoryId
      ]).toPromise();
    }

    const success = await this.publishMarketTemplate(+latestMarketTempl.id, durationDays).toPromise();

    if (!success) {
      throw new Error('Publish Failed');
    }
    return success;
  }


  deleteTemplate(templateId: number): Observable<boolean> {
    return this._rpc.call('template', ['remove', templateId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  createListingPreviewFromTemplate(templateId: number): Observable<ListingItemDetail> {
    return this._rpc.call('template', ['get', templateId]).pipe(
      catchError(() => of(null)),
      map((resp: RespListingTemplate) => this.buildListingDetailFromTemplate(resp))
    );
  }


  calculateMarketTemplateStatus(templ: ProductMarketTemplate): TEMPLATE_STATUS_TYPE {
    switch (true) {
      case (templ.listings.count === 0) && (templ.hash.length === 0):
        return TEMPLATE_STATUS_TYPE.UNPUBLISHED;
        break;
      case (templ.listings.latestExpiry > Date.now()):
        return TEMPLATE_STATUS_TYPE.ACTIVE;
        break;
      case (
          (templ.listings.latestExpiry > 0) && (templ.listings.latestExpiry < Date.now())
        ) || (
          (templ.listings.count === 0) && (templ.hash.length > 0)
        ):
        return TEMPLATE_STATUS_TYPE.EXPIRED;
        break;
      default:
        return TEMPLATE_STATUS_TYPE.UNKNOWN;
    }
  }


  private fetchProductTemplate(productId: number): Observable<RespListingTemplate> {
    return this._rpc.call('template', ['get', productId]);
  }


  private cloneTemplate(templateId: number, marketId?: number): Observable<RespListingTemplate> {
    const params = ['clone', templateId];
    if (+marketId > 0) {
      params.push(+marketId);
    }
    return this._rpc.call('template', params);
  }


  private async buildTemplateForProduct(src: RespListingTemplate): Promise<Template> {
    const newTempl: Template = {
      id: 0,
      type: 'BASE',
      savedDetails: this.getDefaultTemplateSaveDetails(),
      baseTemplate: {
        id: 0,
        marketHashes: []
      }
    };


    if (!isBasicObjectType(src)) {
      return newTempl;
    }

    const isBaseTemplate =  (src.parentListingItemTemplateId === null);

    if (isBaseTemplate) {
      // Process base template

      newTempl.type = 'BASE';
      newTempl.id = +src.id > 0 ? src.id : newTempl.id;
      newTempl.baseTemplate.id = newTempl.id;

      if (Array.isArray(src.ChildListingItemTemplates)) {
        // extract the markets for which the base template has already been used
        src.ChildListingItemTemplates.forEach(child => {
          if (isBasicObjectType(child) && (typeof child.market === 'string')) {
            newTempl.baseTemplate.marketHashes.push(child.market);
          }
        });
      }

      newTempl.savedDetails = this.extractTemplateSavedDetails(src);
      return newTempl;
    }

    // Process market template

    newTempl.type = 'MARKET';

    let parentSrcTempl: RespListingTemplate;
    let latestSrcMarketTempl: RespListingTemplate = src;

    let baseSrcTempl = await this.fetchProductTemplate(src.parentListingItemTemplateId).toPromise();

    if (+baseSrcTempl.parentListingItemTemplateId > 0) {
      // need to go 1 level up for the base template
      parentSrcTempl = baseSrcTempl;
      baseSrcTempl = await this.fetchProductTemplate(+baseSrcTempl.parentListingItemTemplateId).toPromise();
    } else {
      parentSrcTempl = src;
    }

    // ensure we've got the latest version of this market template
    if (Array.isArray(parentSrcTempl.ChildListingItemTemplates)) {
      // NB! sorting here is based on child id values: it is assumed (correct at implementation time) that
      //    a new child market template can only be created if no editable market template exists, thus child market temapltes
      //    with a higher id value must have been created later (MP seems to based on this lookup variation as well)
      const latestChild = parentSrcTempl.ChildListingItemTemplates.filter(basicChild =>
        isBasicObjectType(basicChild) && (+basicChild.id > 0)
      ).sort((a, b) => b.id - a.id)[0];

      if (latestChild) {
        if (latestChild.id !== src.id) {
          latestSrcMarketTempl = await this.fetchProductTemplate(+latestChild.id).toPromise();
        }
      }
    }

    if (isBasicObjectType(latestSrcMarketTempl) &&
        (getValueOrDefault(latestSrcMarketTempl.hash, 'string', '').length > 0) &&
        (+latestSrcMarketTempl.id > 0)
    ) {
      const markets = await this._sharedService.loadMarkets().toPromise();
      if (!Array.isArray(markets) || (markets.length === 0)) {
        throw Error('Failed fetching markets');
      }
      const marketAddress = getValueOrDefault(src.market, 'string', '');
      const foundMarket = markets.find(m => m.receiveAddress === marketAddress);

      if (!foundMarket) {
        throw Error('Failed fetching markets');
      }
      latestSrcMarketTempl = await this.cloneTemplate(+latestSrcMarketTempl.id, foundMarket.id).toPromise();
    }

    if (!isBasicObjectType(latestSrcMarketTempl)) {
      return newTempl;
    }

    newTempl.id = +latestSrcMarketTempl.id > 0 ? +latestSrcMarketTempl.id : newTempl.id;

    newTempl.baseTemplate.id = +baseSrcTempl.id > 0 ? +baseSrcTempl.id : newTempl.baseTemplate.id;

    if (Array.isArray(baseSrcTempl.ChildListingItemTemplates)) {
      // extract the markets for which the base template has already been used
      baseSrcTempl.ChildListingItemTemplates.forEach(child => {
        if (isBasicObjectType(child) && (typeof child.market === 'string')) {
          newTempl.baseTemplate.marketHashes.push(child.market);
        }
      });
    }

    newTempl.savedDetails = this.extractTemplateSavedDetails(latestSrcMarketTempl);

    let categoryId = 0,
        categoryName = '';

    if (isBasicObjectType(latestSrcMarketTempl.ItemInformation) && isBasicObjectType(latestSrcMarketTempl.ItemInformation.ItemCategory)) {
      categoryId = getValueOrDefault(latestSrcMarketTempl.ItemInformation.ItemCategory.id, 'number', categoryId);
      categoryName = getValueOrDefault(latestSrcMarketTempl.ItemInformation.ItemCategory.name, 'string', categoryName);
    }

    newTempl.marketDetails = {
      marketKey: getValueOrDefault(latestSrcMarketTempl.market, 'string', ''),
      category: {
        id: categoryId,
        name: categoryName
      }
    };

    return newTempl;
  }


  private extractTemplateSavedDetails(src: RespListingTemplate): TemplateSavedDetails {

    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
    const saveDetails = this.getDefaultTemplateSaveDetails();

    if (!isBasicObjectType(src)) {
      return saveDetails;
    }

    if (isBasicObjectType(src.ItemInformation)) {
      saveDetails.title = getValueOrDefault(src.ItemInformation.title, 'string', saveDetails.title);
      saveDetails.summary = getValueOrDefault(src.ItemInformation.shortDescription, 'string', saveDetails.summary);
      saveDetails.description = getValueOrDefault(src.ItemInformation.longDescription, 'string', saveDetails.description);

      if (isBasicObjectType(src.ItemInformation.ItemLocation)) {
        saveDetails.shippingOrigin = getValueOrDefault(src.ItemInformation.ItemLocation.country, 'string', saveDetails.shippingOrigin);
      }

      if (Array.isArray(src.ItemInformation.ShippingDestinations)) {
        saveDetails.shippingDestinations = src.ItemInformation.ShippingDestinations.filter(dest =>
          isBasicObjectType(dest) && dest.shippingAvailability === 'SHIPS' && (typeof dest.country === 'string')
        ).map(dest => dest.country);
      }

      if (Array.isArray(src.ItemInformation.Images)) {
        src.ItemInformation.Images.forEach(img => {
          const foundImgData = parseImagePath(img, 'ORIGINAL', marketUrl);
          if (foundImgData) {
            saveDetails.images.push({id: +img.id, url: foundImgData});
          }
        });
      }
    }

    if (isBasicObjectType(src.PaymentInformation)) {
      if (isBasicObjectType(src.PaymentInformation.Escrow) && isBasicObjectType(src.PaymentInformation.Escrow.Ratio)) {
        saveDetails.escrowBuyer = +src.PaymentInformation.Escrow.Ratio.buyer > 0 ?
            +src.PaymentInformation.Escrow.Ratio.buyer : saveDetails.escrowBuyer;

        saveDetails.escrowSeller = +src.PaymentInformation.Escrow.Ratio.seller > 0 ?
        +src.PaymentInformation.Escrow.Ratio.seller : saveDetails.escrowSeller;
      }

      if (isBasicObjectType(src.PaymentInformation.ItemPrice)) {
        saveDetails.priceBase = new PartoshiAmount(+src.PaymentInformation.ItemPrice.basePrice, true);

        if (isBasicObjectType(src.PaymentInformation.ItemPrice.ShippingPrice)) {
          saveDetails.priceShippingLocal = new PartoshiAmount(+src.PaymentInformation.ItemPrice.ShippingPrice.domestic, true);
          saveDetails.priceShippingIntl = new PartoshiAmount(+src.PaymentInformation.ItemPrice.ShippingPrice.international, true);
        }
      }
    }

    return saveDetails;
  }

  private getDefaultTemplateSaveDetails(): TemplateSavedDetails {
    return {
      title: '',
      summary: '',
      description: '',
      shippingOrigin: '',
      shippingDestinations: [],
      priceBase: new PartoshiAmount(0),
      priceShippingLocal: new PartoshiAmount(0),
      priceShippingIntl: new PartoshiAmount(0),
      images: [],
      escrowBuyer: 100,
      escrowSeller: 100,
    };
  }


  private buildProductsFromTemplateList(srcList: RespListingTemplate[]): ProductItem[] {
    const allProductItems: ProductItem[] = [];
    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
    const defaultImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;

    const marketTemplMap: Map<number, RespListingTemplate> = new Map();
    const baseTemplates: RespListingTemplate[] = [];

    srcList.forEach(srcItem => {
      if (isBasicObjectType(srcItem) && (+srcItem.id > 0)) {
        if (+srcItem.parentListingItemTemplateId > 0) {
          // is market template
          marketTemplMap.set(+srcItem.id, srcItem);
        } else {
          // is base template
          baseTemplates.push(srcItem);
        }
      }
    });

    baseTemplates.forEach(baseTempl => {
      const newProduct: ProductItem = {
        id: 0,
        title: '',
        summary: '',
        created: 0,
        updated: 0,
        images: [],
        priceBase: {whole: '', sep: '', fraction: ''},
        priceShippingLocal: {whole: '', sep: '', fraction: ''},
        priceShippingIntl: {whole: '', sep: '', fraction: ''},
        sourceLocation: '',
        markets: []
      };

      // Extract base template details for product information

      newProduct.id = +baseTempl.id > 0 ? +baseTempl.id : newProduct.id;
      newProduct.created = +baseTempl.createdAt > 0 ? +baseTempl.createdAt : newProduct.created;
      newProduct.updated = +baseTempl.updatedAt > 0 ? +baseTempl.updatedAt : newProduct.updated;

      if (isBasicObjectType(baseTempl.ItemInformation)) {
        newProduct.title = getValueOrDefault(baseTempl.ItemInformation.title, 'string', newProduct.title);
        newProduct.summary = getValueOrDefault(baseTempl.ItemInformation.shortDescription, 'string', newProduct.summary);

        if (isBasicObjectType(baseTempl.ItemInformation.ItemLocation)) {
          newProduct.sourceLocation = getValueOrDefault(
            baseTempl.ItemInformation.ItemLocation.country, 'string', newProduct.sourceLocation
          );
        }

        if (Array.isArray(baseTempl.ItemInformation.Images)) {
          baseTempl.ItemInformation.Images.filter(img =>
            isBasicObjectType(img)
          ).sort((a, b) =>
            +(!!a.featured) - +(!!b.featured)
          ).forEach(img => {
            const imgPath = parseImagePath(img, 'ORIGINAL', marketUrl);
            if (imgPath.length) {
              newProduct.images.push(imgPath);
            }
          });
        }

        if (newProduct.images.length === 0) {
          // ensure that at least the default blank image is created if no other images are found
          newProduct.images.push(defaultImage);
        }
      }

      if (isBasicObjectType(baseTempl.PaymentInformation) && isBasicObjectType(baseTempl.PaymentInformation.ItemPrice)) {
        const basePrice = new PartoshiAmount(baseTempl.PaymentInformation.ItemPrice.basePrice, true);
        newProduct.priceBase = {
          whole: basePrice.particlStringInteger(),
          sep: basePrice.particlStringSep(),
          fraction: basePrice.particlStringFraction()
        };

        if (isBasicObjectType(baseTempl.PaymentInformation.ItemPrice.ShippingPrice)) {
          const localShip = new PartoshiAmount(baseTempl.PaymentInformation.ItemPrice.ShippingPrice.domestic, true);
          newProduct.priceShippingLocal = {
            whole: localShip.particlStringInteger(),
            sep: localShip.particlStringSep(),
            fraction: localShip.particlStringFraction()
          };

          const intlShip = new PartoshiAmount(baseTempl.PaymentInformation.ItemPrice.ShippingPrice.international, true);
          newProduct.priceShippingIntl = {
            whole: intlShip.particlStringInteger(),
            sep: intlShip.particlStringSep(),
            fraction: intlShip.particlStringFraction()
          };
        }
      }

      // Process any associated market templates

      if (Array.isArray(baseTempl.ChildListingItemTemplates) && (baseTempl.ChildListingItemTemplates.length > 0)) {
        baseTempl.ChildListingItemTemplates.forEach(basicMarketTempl => {

          if (!isBasicObjectType(basicMarketTempl) || !(+basicMarketTempl.id > 0) || !(marketTemplMap.has(+basicMarketTempl.id))) {
            return;
          }

          const marketTempl = marketTemplMap.get(+basicMarketTempl.id);

          let listingCount = 0;
          let lastExpiryTimestamp = 0;

          // process any "root" market template listings
          if (Array.isArray(marketTempl.ListingItems)) {
            marketTempl.ListingItems.forEach(li => {
              if (isBasicObjectType(li)) {
                listingCount += 1;

                if ((+li.expiredAt > lastExpiryTimestamp)) {
                  lastExpiryTimestamp = +li.expiredAt;
                }
              }
            });
          }

          let latestMarketTempl = marketTempl;

          if (Array.isArray(marketTempl.ChildListingItemTemplates)) {
            marketTempl.ChildListingItemTemplates.forEach(childTempl => {
              const childMarketTemplate = marketTemplMap.get(+childTempl.id);

              if (childMarketTemplate) {
                if (+childMarketTemplate.id > +latestMarketTempl.id) {
                  // find the latest template
                  latestMarketTempl = childMarketTemplate;
                }

                // process any "child" market template listings
                if (Array.isArray(childMarketTemplate.ListingItems)) {
                  childMarketTemplate.ListingItems.forEach(li => {
                    if (isBasicObjectType(li)) {
                      listingCount += 1;

                      if ((+li.expiredAt > lastExpiryTimestamp)) {
                        lastExpiryTimestamp = +li.expiredAt;
                      }
                    }
                  });
                }
              }
            });
          }

          const newMarketDetails = this.buildBasicProductMarketItem(latestMarketTempl, marketUrl, defaultImage);
          newMarketDetails.listings.count = listingCount;
          newMarketDetails.listings.latestExpiry = lastExpiryTimestamp;
          newMarketDetails.status = this.calculateMarketTemplateStatus(newMarketDetails);

          if (newMarketDetails.id > 0) {
            newProduct.markets.push(newMarketDetails);
          }

        });
      }

      if (newProduct.id > 0) {
        allProductItems.push(newProduct);
      }

    });

    return allProductItems;
  }


  private buildBasicProductMarketItem(src: RespListingTemplate, marketUrl: string, defaultImage: string): ProductMarketTemplate {
    const newMarketDetails: ProductMarketTemplate = {
      id: 0,
      title: '',
      priceBase: {whole: '', sep: '', fraction: ''},
      marketKey: '',
      categoryName: '',
      categoryId: 0,
      hash: '',
      status: TEMPLATE_STATUS_TYPE.UNPUBLISHED,
      created: 0,
      updated: 0,
      image: defaultImage,
      listings: {
        count: 0,
        latestExpiry: 0
      }
    };

    if (!isBasicObjectType(src)) {
      return newMarketDetails;
    }

    // fill in newMarketDetails from the latest template
    newMarketDetails.id = +src.id > 0 ? +src.id : newMarketDetails.id;
    newMarketDetails.marketKey = getValueOrDefault(src.market, 'string', newMarketDetails.marketKey);
    newMarketDetails.hash = getValueOrDefault(src.hash, 'string', newMarketDetails.hash);
    newMarketDetails.created = +src.createdAt > 0 ? +src.createdAt : newMarketDetails.created;
    newMarketDetails.updated = +src.updatedAt > 0 ? +src.updatedAt : newMarketDetails.updated;

    if (isBasicObjectType(src.ItemInformation)) {
      newMarketDetails.title = getValueOrDefault(src.ItemInformation.title, 'string', newMarketDetails.title);

      if (isBasicObjectType(src.ItemInformation.ItemCategory)) {
        newMarketDetails.categoryName = getValueOrDefault(
          src.ItemInformation.ItemCategory.name, 'string', newMarketDetails.categoryName
        );
        newMarketDetails.categoryId = getValueOrDefault(
          src.ItemInformation.ItemCategory.id, 'number', newMarketDetails.categoryId
        );
      }

      if ((Array.isArray(src.ItemInformation.Images)) && src.ItemInformation.Images.length) {
        let featured = src.ItemInformation.Images.find(img => isBasicObjectType(img) && !!img.featured);
        if (featured === undefined) {
          featured = src.ItemInformation.Images[0];
        }
        newMarketDetails.image = parseImagePath(featured, 'ORIGINAL', marketUrl) || newMarketDetails.image;
      }
    }

    if (isBasicObjectType(src.PaymentInformation) && isBasicObjectType(src.PaymentInformation.ItemPrice)) {
      const basePrice = new PartoshiAmount(src.PaymentInformation.ItemPrice.basePrice, true);
      newMarketDetails.priceBase = {
        whole: basePrice.particlStringInteger(),
        sep: basePrice.particlStringSep(),
        fraction: basePrice.particlStringFraction()
      };
    }

    return newMarketDetails;
  }


  private buildListingDetailFromTemplate(src: RespListingTemplate): ListingItemDetail {
    const listingItem = {
      id: 0,
      marketId: 0,
      hash: '',
      title: '',
      summary: '',
      description: '',
      images: {
        featured: -1,
        images: [],
      },
      price: {
        base: 0,
        shippingDomestic: 0,
        shippingIntl: 0,
      },
      shippingFrom: {
        code: '',
        name: ''
      },
      shippingTo: [],
      category: {
        id: 0,
        title: '',
      },
      seller: '',
      timeData: {
        expires: 0,
        created: 0,
      },
      escrow: {
        buyerRatio: 100,
        sellerRatio: 100,
      },
      extra: {
        flaggedProposal: '',
        isOwn: true,
        favouriteId: 0
      },
    };

    if (isBasicObjectType(src)) {

      const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;

      listingItem.id = +src.id > 0 ? +src.id : listingItem.id;
      listingItem.hash = getValueOrDefault(src.hash, 'string', listingItem.hash);
      listingItem.timeData.created = +src.createdAt > 0 ? +src.createdAt : listingItem.timeData.created;

      if (isBasicObjectType(src.ItemInformation)) {
        listingItem.title = getValueOrDefault(src.ItemInformation.title, 'string', listingItem.title);
        listingItem.summary = getValueOrDefault(src.ItemInformation.shortDescription, 'string', listingItem.summary);
        listingItem.description = getValueOrDefault(src.ItemInformation.longDescription, 'string', listingItem.description);

        const countryCodes: string[] = [];
        let sourceCode = '';
        if (isBasicObjectType(src.ItemInformation.ItemLocation)) {
          sourceCode = getValueOrDefault(src.ItemInformation.ItemLocation.country, 'string', listingItem.shippingFrom.code);
          if (sourceCode.length) {
            countryCodes.push(sourceCode);
          }
        }

        if (Array.isArray(src.ItemInformation.ShippingDestinations)) {
          const sourceCodes = src.ItemInformation.ShippingDestinations.filter(dest =>
            isBasicObjectType(dest) && dest.shippingAvailability === 'SHIPS' && (typeof dest.country === 'string')
          ).map(dest => dest.country);

          countryCodes.push(...sourceCodes);
        }

        const countries = this._regionService.findCountriesByIsoCodes(countryCodes);

        const sourceCountryIdx = countries.findIndex(c => c.iso === sourceCode);
        if (sourceCountryIdx > -1) {
          listingItem.shippingFrom.code = countries[sourceCountryIdx].iso;
          listingItem.shippingFrom.name = countries[sourceCountryIdx].name;
          const sourceIdx = countryCodes.findIndex(cc => cc === sourceCode);
          countryCodes.splice(sourceIdx, 1);
        }

        countryCodes.forEach(cc => {
          const country = countries.find(c => c.iso === cc);
          if (country) {
            listingItem.shippingTo.push({code: country.iso, name: country.name});
          }
        });

        if (Array.isArray(src.ItemInformation.Images)) {
          src.ItemInformation.Images.forEach( (img, imgIdx) => {
            const orig = parseImagePath(img, 'ORIGINAL', marketUrl);
            const thumb = parseImagePath(img, 'ORIGINAL', marketUrl);

            if ((orig.length > 0) && (thumb.length > 0)) {
              listingItem.images.images.push({THUMBNAIL: thumb, IMAGE: orig});

              if (img.featured) {
                listingItem.images.featured = imgIdx;
              }
            }
          });
        }

        if (isBasicObjectType(src.ItemInformation.ItemCategory)) {
          listingItem.category.id = getValueOrDefault(src.ItemInformation.ItemCategory.id, 'number', listingItem.category.id);
          listingItem.category.title = getValueOrDefault(src.ItemInformation.ItemCategory.name, 'string', listingItem.category.title);
        }
      }

      if (isBasicObjectType(src.PaymentInformation)) {

        if (isBasicObjectType(src.PaymentInformation.ItemPrice)) {
          listingItem.price.base = +src.PaymentInformation.ItemPrice.basePrice > 0 ?
            +src.PaymentInformation.ItemPrice.basePrice : listingItem.price.base;

          if (isBasicObjectType(src.PaymentInformation.ItemPrice.ShippingPrice)) {
            listingItem.price.shippingDomestic = +src.PaymentInformation.ItemPrice.ShippingPrice.domestic > 0 ?
              +src.PaymentInformation.ItemPrice.ShippingPrice.domestic : listingItem.price.shippingDomestic;

            listingItem.price.shippingIntl = +src.PaymentInformation.ItemPrice.ShippingPrice.international > 0 ?
              +src.PaymentInformation.ItemPrice.ShippingPrice.international : listingItem.price.shippingIntl;
          }
        }
      }
    }

    const actualListingItem: ListingItemDetail = listingItem;

    return actualListingItem;
  }

}
