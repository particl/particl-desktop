import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType, formatImagePath } from '../shared/utils';
import { RespListingTemplate } from '../shared/market.models';
import { Template, TemplateSavedDetails } from './sell.models';


@Injectable()
export class SellService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  fetchTemplateForProduct(productId: number): Observable<Template> {
    return this.fetchProductTemplate(productId).pipe(
      concatMap((resp) => this.buildTemplateForProduct(resp))
    );
  }


  private fetchProductTemplate(productId: number): Observable<RespListingTemplate> {
    return this._rpc.call('template', ['get', productId]);
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
        (+basicChild.id > 0)
      ).sort((a, b) => b.id - a.id)[0];

      if (latestChild) {
        if (latestChild.id !== src.id) {
          latestSrcMarketTempl = await this.fetchProductTemplate(+latestChild.id).toPromise();
        }
      }
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
      hash: getValueOrDefault(latestSrcMarketTempl.hash, 'string', ''),
      marketKey: getValueOrDefault(latestSrcMarketTempl.market, 'string', ''),
      category: {
        id: categoryId,
        name: categoryName
      }
    };

    return newTempl;
  }


  private extractTemplateSavedDetails(src: RespListingTemplate): TemplateSavedDetails {

    const marketPort = this._store.selectSnapshot(MarketState.settings).port;
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

      if (Array.isArray(src.ItemInformation.ItemImages)) {
        src.ItemInformation.ItemImages.forEach(img => {
          if (isBasicObjectType(img) && Array.isArray(img.ItemImageDatas)) {
            const foundImgData = img.ItemImageDatas.find(imgData =>
              isBasicObjectType(imgData) && (imgData.imageVersion === 'ORIGINAL') && getValueOrDefault(imgData.dataId, 'string', '')
            );

            if (foundImgData) {
              const imgPath = formatImagePath(foundImgData.dataId, marketPort);
              saveDetails.images.push({id: +img.id, url: imgPath});
            }
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


  // findTemplates(
  //   profileID: number,
  //   pageNum: number,
  //   pageCount: number,
  //   orderField: TEMPLATE_SORT_FIELD_TYPE,
  //   searchTerm: string = '',
  //   isPublished?: boolean
  // ): Observable<(BaseTemplate | MarketTemplate)[]> {
  //   const searchParams: any[] = ['search', pageNum, pageCount, 'ASC', orderField, profileID, searchTerm ? searchTerm : '*', []];
  //   if (typeof isPublished === 'boolean') {
  //     searchParams.push(isPublished);
  //   }
  //   return this._rpc.call('template', searchParams).pipe(
  //     map((resp: RespListingTemplate[]) => {

  //       const marketPort = this._store.selectSnapshot(MarketState.settings).port;

  //       return resp.map((respItem: RespListingTemplate) => {
  //         return this.buildTemplate(respItem, marketPort);
  //       });
  //     })
  //   );
  // }


  // removeTemplateImage(imageID: number): Observable<void> {
  //   return this._rpc.call('template', ['image', 'remove', imageID]);
  // }


  // getTemplateSize(templateId: number): Observable<RespTemplateSize> {
  //   return this._rpc.call('template', ['size', templateId]);
  // }


  // createNewTemplate(data: NewTemplateData): Observable<number> {
  //   const profile = this._store.selectSnapshot(MarketState.currentProfile).id;
  //   const addParams = [
  //     'add',
  //     profile,
  //     data.title,
  //     data.shortDescription,
  //     data.longDescription,
  //     null,  // category id is not provided here yet (not set here yet)
  //     data.salesType,
  //     data.currency,
  //     data.basePrice,
  //     data.domesticShippingPrice,
  //     data.foreignShippingPrice,
  //     data.escrowType,
  //     data.escrowBuyerRatio,
  //     data.escrowSellerRatio,
  //     data.escrowReleaseType
  //   ];

  //   return this._rpc.call('template', addParams).pipe(
  //     concatMap((resp: RespListingTemplate) => {
  //       const templateID = resp.id;

  //       const queries = [];

  //       queries.push(['location', 'update', templateID, data.shippingFrom]);

  //       (data.shippingTo || []).forEach((dest: string) => {
  //         queries.push(['shipping', 'add', templateID, dest, 'SHIPS']);
  //       });

  //       (data.images || []).forEach(image => {
  //         const imageParts = image.data.split(',');
  //         const imgData = imageParts.length === 2 ? imageParts[1] : image.data;
  //         queries.push(['image', 'add', templateID, '', image.type, image.encoding, imgData]);
  //       });

  //       return from(queries).pipe(
  //         concatMap(params => {
  //           return this._rpc.call('template', params).pipe(catchError(() => of(null)), mapTo(templateID));
  //         })
  //       );
  //     }),
  //     last(),  // wait for all of the requests to complete before emitting
  //   );

  // }


  // updateExistingTemplate(templateID: number, details: UpdateTemplateData): Observable<void> {
  //   const updates$: Observable<any>[] = [];
  //   if (details.info) {
  //     const rpc$ = this._rpc.call('template', [
  //       'information',
  //       'update',
  //       templateID,
  //       details.info.title || '',
  //       details.info.shortDescription || '',
  //       details.info.longDescription || '',
  //       +details.info.category || null
  //     ]);
  //     updates$.push(rpc$);
  //   }
  //   if (details.payment) {
  //     const args = [
  //       'payment',
  //       'update',
  //       templateID,
  //       details.payment.salesType,
  //       details.payment.currency,
  //       details.payment.basePrice,
  //       details.payment.domesticShippingPrice,
  //       details.payment.foreignShippingPrice
  //     ];
  //     updates$.push(this._rpc.call('template', args));
  //   }
  //   if (details.shippingFrom) {
  //     updates$.push(this._rpc.call('template', ['location', 'update', templateID, details.shippingFrom]));
  //   }
  //   if (details.shippingTo) {
  //     if (details.shippingTo.add) {
  //       details.shippingTo.add.forEach(dest =>
  //         updates$.push(this._rpc.call('template', ['shipping', 'add', templateID, dest, 'SHIPS']))
  //       );
  //     }
  //     if (details.shippingTo.remove) {
  //       details.shippingTo.remove.forEach(dest =>
  //         updates$.push(this._rpc.call('template', ['shipping', 'remove', templateID, dest, 'SHIPS']))
  //       );
  //     }
  //   }
  //   if (details.images) {
  //     details.images.forEach(image => {
  //       const imageParts = image.data.split(',');
  //       const imgData = imageParts.length === 2 ? imageParts[1] : image.data;
  //       updates$.push(this._rpc.call('template', ['image', 'add', templateID, '', image.type, image.encoding, imgData]));
  //     });
  //   }

  //   if (updates$.length <= 0) {
  //     // prevent error
  //     updates$.push(of(null));
  //   }

  //   return from(updates$).pipe(
  //     concatAll(),
  //     last()
  //   );
  // }


  // publishTemplate(
  //   templateID: number, marketID: number, duration: number, categoryID: number = null, estimateOnly: boolean = true
  // ): Observable<any> {  // TODO: create relevant return type and set it correctly here when it is known

  //   let obs = of();

  //   if (+categoryID > 0) {
  //     obs = this.fetchTemplate(templateID).pipe(
  //       concatMap((template: ListingTemplate) => {
  //         const details: UpdateTemplateData = {
  //           info: {
  //             title: template.information.title,
  //             shortDescription: template.information.summary,
  //             longDescription: template.information.description,
  //             category: categoryID
  //           }
  //         };
  //         return this.updateExistingTemplate(templateID, details);
  //       })
  //     );
  //   }

  //   return obs.pipe(concatMap(() => this._rpc.call('template', ['post', templateID, duration, marketID, estimateOnly])));
  // }


  // cloneTemplate(sourceID: number): Observable<any> {
  //   return this._rpc.call('template', ['clone', sourceID]);
  // }


  // createNewCategory(name: string, parentID: number, marketID: number): Observable<number> {
  //   return this._rpc.call('category', ['add', marketID, name, '', parentID]).pipe(
  //     map((resp: RespCategoryAdd) => {
  //       return resp.id;
  //     })
  //   );
  // }


  // deleteTemplate(templateID: number): Observable<boolean> {
  //   return this._rpc.call('template', ['remove', +templateID]).pipe(
  //     catchError(() => of(false)),
  //     map(resp => typeof resp === 'boolean' ? resp : true)
  //   );
  // }

}
