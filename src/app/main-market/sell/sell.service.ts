import { Injectable } from '@angular/core';
import { } from 'rxjs';
import {  } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import {  } from '../shared/market.models';


@Injectable()
export class SellService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  // fetchTemplate(templateId: number): Observable<BaseTemplate | MarketTemplate>  {
  //   const marketPort = this._store.selectSnapshot(MarketState.settings).port;

  //   return this._rpc.call('template', ['get', templateId]).pipe(
  //     map((resp: RespListingTemplate) => {
  //       if (Object.keys(resp.ItemInformation).length <= 0) {
  //         throwError('Invalid template');
  //         return;
  //       }
  //       return this.buildTemplate(resp, marketPort);
  //     })
  //   );
  // }


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


  // setTemplateCategory(templateID: number, categoryID: number): Observable<void> {
  //   return this.fetchTemplate(templateID).pipe(
  //       concatMap((templ: ListingTemplate) => {
  //         const info: UpdateTemplateData = {
  //           info: {
  //             title: templ.information.title,
  //             shortDescription: templ.information.summary,
  //             longDescription: templ.information.description,
  //             category: categoryID
  //           }
  //         };
  //         return this.updateExistingTemplate(templateID, info);
  //       })
  //     );
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


  // private buildTemplate(source: RespListingTemplate, marketPort: number): BaseTemplate | MarketTemplate {
  //   const childTemplates = this.getItemOfType(source.ChildListingItemTemplate, 'Array', []);
  //   const sourceMarket = this.getItemOfType(source.market, 'String', '');

  //   let sourceTemplate = source;
  //   const isMarketTemplate = sourceMarket.length > 0;

  //   if (isMarketTemplate) {
  //     // Dealing with a Market Template, so we need to ensure we find the correct latest "version" of it
  //     try {
  //       sourceTemplate = childTemplates.sort((a, b) => +b.createdAt - +a.createdAt)[0];
  //     } catch (e) {
  //       // nothing to do, right now... maybe log this out in the future?
  //     }
  //   }


  //   const itemInfo = this.getItemOfType(sourceTemplate.ItemInformation, 'Object', {} as RespListingTemplateInformation);
  //   const sourceHash = this.getItemOfType(sourceTemplate.hash, 'String', '');

  //   // Extract source payment details
  //   const paymentInfo = sourceTemplate.PaymentInformation ? sourceTemplate.PaymentInformation : null;

  //   const itemPrice = paymentInfo && paymentInfo.ItemPrice ? paymentInfo.ItemPrice : null;
  //   const shippingPrice = itemPrice && itemPrice.ShippingPrice ? itemPrice.ShippingPrice : null;
  //   const basePrice = (itemPrice && +itemPrice.basePrice) || 0;
  //   const shipLocal = (shippingPrice && +shippingPrice.domestic) || 0;
  //   const shipIntl = (shippingPrice && +shippingPrice.international) || 0;

  //   // Extract sourceTemplate shipping location
  //   const sourceShipLocationId = itemInfo && itemInfo.ItemLocation && +itemInfo.ItemLocation.id ? +itemInfo.ItemLocation.id : 0;

  //   // Create the basic template details
  //   const templDetails = {
  //     information: {
  //       id: this.getItemOfType(itemInfo.id, 'Number', 0),
  //       title: this.getItemOfType(itemInfo.title, 'String', ''),
  //       summary: this.getItemOfType(itemInfo.shortDescription, 'String', ''),
  //       description: this.getItemOfType(itemInfo.longDescription, 'String', ''),
  //     },

  //     shippingOrigin: {
  //       id: sourceShipLocationId > 0 ? sourceShipLocationId : 0,
  //       countryCode: sourceShipLocationId > 0 ? this.getItemOfType(itemInfo.ItemLocation.country, 'String', '') : '',
  //     },

  //     shippingDestinations: this.getItemOfType(itemInfo.ShippingDestinations, 'Array', []).map(d => {
  //       const dest: TemplateDetails.ShippingDestination = {
  //         id: +d.id,
  //         type: d.shippingAvailability,
  //         countryCode: d.country
  //       };
  //       return dest;
  //     }).filter(
  //       d => (+d.id > 0) && (typeof d.countryCode === 'string') && (d.type === 'SHIPS')
  //     ),

  //     images: this.getItemOfType(itemInfo.ItemImages, 'Array', []).map(value => {
  //       let thumbnailUrl: string;
  //       let imageUrl: string;
  //       const imgDatas = this.getItemOfType(value.ItemImageDatas, 'Array', []);
  //       for (const imgData of imgDatas) {
  //         if (imgData.imageVersion === 'THUMBNAIL') {
  //           thumbnailUrl = this.formatImagePath(
  //             this.getItemOfType(imgData.dataId, 'String', ''),
  //             marketPort
  //           );
  //         } else if (imgData.imageVersion === 'MEDIUM') {
  //           imageUrl = this.formatImagePath(
  //             this.getItemOfType(imgData.dataId, 'String', ''),
  //             marketPort
  //           );
  //         }
  //       }

  //       const img: TemplateDetails.Image = {
  //         id: +value.id || 0,
  //         featured: !!value.featured,
  //         thumbnailUrl: thumbnailUrl || '',
  //         imageUrl: imageUrl || '',
  //       };
  //       return img;
  //     }),

  //     price: {
  //       id: (itemPrice && +itemPrice.id) || 0,
  //       currency: this.getItemOfType(itemPrice && itemPrice.currency, 'String', 'PART') as CURRENCY_TYPE,
  //       basePrice: new PartoshiAmount(basePrice),
  //       shippingLocal: new PartoshiAmount(shipLocal),
  //       shippingInternational: new PartoshiAmount(shipIntl)
  //     },

  //     payment: {
  //       id: (paymentInfo && +paymentInfo.id) || 0,
  //  type: this.getItemOfType( (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.type) || null, 'String', 'SALE') as SALES_TYPE,
  //       escrow: {
  //         type: this.getItemOfType( (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.type) || null, 'String', 'MAD_CT'),
  //         buyerRatio: this.getItemOfType(
  //           (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.Ratio && paymentInfo.Escrow.Ratio.buyer) || null,
  //           'Number',
  //           100
  //         ),
  //         sellerRatio: this.getItemOfType(
  //           (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.Ratio && paymentInfo.Escrow.Ratio.seller) || null,
  //           'Number',
  //           100
  //         )
  //       }
  //     },
  //   };

  //   // Process each type of template

  //   if (!isMarketTemplate) {
  //     // Base Template

  //     const linkedMarketTemplates: MarketTemplate[] = childTemplates.filter(
  //       child => child && child.market && (this.getItemOfType(child.market, 'String', '') !== '')
  //     ).map(
  //       child => this.buildTemplate(child, marketPort) as MarketTemplate
  //     );

  //     const baseTemplate: BaseTemplate = {
  //       id: +sourceTemplate.id > 0 ? +sourceTemplate.id : 0,
  //       hash: sourceHash,
  //       type: TEMPLATE_TYPE.BASE,
  //       marketTemplates: linkedMarketTemplates,
  //       details: templDetails,
  //       created: +sourceTemplate.createdAt > 0 ? +sourceTemplate.createdAt : 0,
  //       updated: +sourceTemplate.updatedAt > 0 ? +sourceTemplate.updatedAt : 0,
  //     };
  //     return baseTemplate;
  //   }

  //   // Market Template

  //   const sourceHasListings = this.getItemOfType(sourceTemplate.ListingItems, 'Array', []).length > 0;

  //   // Extract template status type information
  //   let sourceStatus: TEMPLATE_STATUS_TYPE;
  //   switch (true) {
  //     // TODO zaSmilingIdiot 2020-05-26 -> Add in Expired case here as well
  //     //    (requires knowing what the listing item expiry field is, which is not known at the time of this comment)
  //     case (sourceHash.length > 0) && sourceHasListings: sourceStatus = TEMPLATE_STATUS_TYPE.PUBLISHED; break;
  //     case (sourceHash.length > 0) && !sourceHasListings: sourceStatus = TEMPLATE_STATUS_TYPE.PENDING; break;
  //     default: sourceStatus = TEMPLATE_STATUS_TYPE.UNPUBLISHED;
  //   }

  //   // @TODO: Implement market templates correctly
  //   const marketTemplate: MarketTemplate = {
  //     id: +sourceTemplate.id > 0 ? +sourceTemplate.id : 0,
  //     hash: sourceHash,
  //     type: TEMPLATE_TYPE.MARKET,
  //     details: templDetails,
  //     created: +source.createdAt > 0 ? +source.createdAt : 0,
  //     updated: +sourceTemplate.updatedAt > 0 ? +sourceTemplate.updatedAt : 0,
  //     market: {
  //       id: 0,
  //       key: sourceMarket,
  //       name: ''
  //     },
  //     category: {
  //       id: 0,
  //       name: ''
  //     },
  //     baseTemplateId: +sourceTemplate.parentListingItemTemplateId,
  //     status: sourceStatus
  //   };

  //   return marketTemplate;

  // }


  // private formatImagePath(path: string, port: number): string {
  //   const pathparts = path.split(':');

  //   if (pathparts.length !== 3) {
  //     return path;
  //   }

  //   let final = pathparts[2];
  //   const remainder = pathparts[2].split('/');
  //   if ((typeof +remainder[0] === 'number') && +remainder[0]) {
  //     final = remainder.slice(1).join('/');
  //   }
  //   return `${[pathparts[0], pathparts[1], String(port)].join(':')}/${final}`;
  // }


  // private getItemOfType<T>(value: T, type: 'Number' | 'Object' | 'Array' | 'String', defaultValue: T): T {
  //   return Object.prototype.toString.call(value) === `[object ${type}]` ? value : defaultValue;
  // }

}
