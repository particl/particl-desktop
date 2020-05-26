import { Injectable } from '@angular/core';
import { Observable, of, throwError, from } from 'rxjs';
import { map, concatMap, mapTo, catchError, last, concatAll } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { RespListingTemplate, RespCategoryAdd, RespTemplateSize } from '../shared/market.models';
import {
  NewTemplateData,
  ListingTemplate,
  TemplateShippingDestination,
  TemplateImage,
  UpdateTemplateData,
  TEMPLATE_SORT_FIELD_TYPE,
  TEMPLATE_STATUS_TYPE
} from './sell.models';


@Injectable()
export class SellService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  fetchTemplate(templateId: number): Observable<ListingTemplate>  {
    const marketPort = this._store.selectSnapshot(MarketState.settings).port;

    return this._rpc.call('template', ['get', templateId]).pipe(
      map((resp: RespListingTemplate) => {
        if (Object.keys(resp.ItemInformation).length <= 0) {
          throwError('Invalid template');
          return;
        }
        return this.buildTemplate(resp, marketPort);
      })
    );
  }


  findTemplates(
    profileID: number,
    pageNum: number,
    pageCount: number,
    orderField: TEMPLATE_SORT_FIELD_TYPE,
    searchTerm: string = '',
    isPublished?: boolean
  ): Observable<ListingTemplate[]> {
    const searchParams: any[] = ['search', pageNum, pageCount, 'ASC', orderField, profileID, searchTerm ? searchTerm : '*', []];
    if (typeof isPublished === 'boolean') {
      searchParams.push(isPublished);
    }
    return this._rpc.call('template', searchParams).pipe(
      map((resp: RespListingTemplate[]) => {

        const marketPort = this._store.selectSnapshot(MarketState.settings).port;

        return resp.map((respItem: RespListingTemplate) => {
          return this.buildTemplate(respItem, marketPort);
        });
      })
    );
  }


  removeTemplateImage(imageID: number): Observable<void> {
    return this._rpc.call('template', ['image', 'remove', imageID]);
  }


  getTemplateSize(templateId: number): Observable<RespTemplateSize> {
    return this._rpc.call('template', ['size', templateId]);
  }


  createNewTemplate(data: NewTemplateData): Observable<number> {
    const profile = this._store.selectSnapshot(MarketState.currentProfile).id;
    const addParams = [
      'add',
      profile,
      data.title,
      data.shortDescription,
      data.longDescription,
      null,  // category id is not provided here yet (not set here yet)
      data.salesType,
      data.currency,
      data.basePrice,
      data.domesticShippingPrice,
      data.foreignShippingPrice,
      data.escrowType,
      data.escrowBuyerRatio,
      data.escrowSellerRatio,
      data.escrowReleaseType
    ];

    return this._rpc.call('template', addParams).pipe(
      concatMap((resp: RespListingTemplate) => {
        const templateID = resp.id;

        const queries = [];

        queries.push(['location', 'update', templateID, data.shippingFrom]);

        (data.shippingTo || []).forEach((dest: string) => {
          queries.push(['shipping', 'add', templateID, dest, 'SHIPS']);
        });

        (data.images || []).forEach(image => {
          const imageParts = image.data.split(',');
          const imgData = imageParts.length === 2 ? imageParts[1] : image.data;
          queries.push(['image', 'add', templateID, '', image.type, image.encoding, imgData]);
        });

        return from(queries).pipe(
          concatMap(params => {
            return this._rpc.call('template', params).pipe(catchError(() => of(null)), mapTo(templateID));
          })
        );
      }),
      last(),  // wait for all of the requests to complete before emitting
    );

  }


  setTemplateCategory(templateID: number, categoryID: number): Observable<void> {
    return this.fetchTemplate(templateID).pipe(
        concatMap((templ: ListingTemplate) => {
          const info: UpdateTemplateData = {
            info: {
              title: templ.information.title,
              shortDescription: templ.information.summary,
              longDescription: templ.information.description,
              category: categoryID
            }
          };
          return this.updateExistingTemplate(templateID, info);
        })
      );
  }


  updateExistingTemplate(templateID: number, details: UpdateTemplateData): Observable<void> {
    const updates$: Observable<any>[] = [];
    if (details.info) {
      const rpc$ = this._rpc.call('template', [
        'information',
        'update',
        templateID,
        details.info.title || '',
        details.info.shortDescription || '',
        details.info.longDescription || '',
        +details.info.category || null
      ]);
      updates$.push(rpc$);
    }
    if (details.payment) {
      const args = [
        'payment',
        'update',
        templateID,
        details.payment.salesType,
        details.payment.currency,
        details.payment.basePrice,
        details.payment.domesticShippingPrice,
        details.payment.foreignShippingPrice
      ];
      updates$.push(this._rpc.call('template', args));
    }
    if (details.shippingFrom) {
      updates$.push(this._rpc.call('template', ['location', 'update', templateID, details.shippingFrom]));
    }
    if (details.shippingTo) {
      if (details.shippingTo.add) {
        details.shippingTo.add.forEach(dest =>
          updates$.push(this._rpc.call('template', ['shipping', 'add', templateID, dest, 'SHIPS']))
        );
      }
      if (details.shippingTo.remove) {
        details.shippingTo.remove.forEach(dest =>
          updates$.push(this._rpc.call('template', ['shipping', 'remove', templateID, dest, 'SHIPS']))
        );
      }
    }
    if (details.images) {
      details.images.forEach(image => {
        const imageParts = image.data.split(',');
        const imgData = imageParts.length === 2 ? imageParts[1] : image.data;
        updates$.push(this._rpc.call('template', ['image', 'add', templateID, '', image.type, image.encoding, imgData]));
      });
    }

    if (updates$.length <= 0) {
      // prevent error
      updates$.push(of(null));
    }

    return from(updates$).pipe(
      concatAll(),
      last()
    );
  }


  publishTemplate(
    templateID: number, marketID: number, duration: number, categoryID: number = null, estimateOnly: boolean = true
  ): Observable<any> {  // TODO: create relevant return type and set it correctly here when it is known

    let obs = of();

    if (+categoryID > 0) {
      obs = this.fetchTemplate(templateID).pipe(
        concatMap((template: ListingTemplate) => {
          const details: UpdateTemplateData = {
            info: {
              title: template.information.title,
              shortDescription: template.information.summary,
              longDescription: template.information.description,
              category: categoryID
            }
          };
          return this.updateExistingTemplate(templateID, details);
        })
      );
    }

    return obs.pipe(concatMap(() => this._rpc.call('template', ['post', templateID, duration, marketID, estimateOnly])));
  }


  createNewCategory(name: string, parentID: number, marketID: number): Observable<number> {
    return this._rpc.call('category', ['add', marketID, name, '', parentID]).pipe(
      map((resp: RespCategoryAdd) => {
        return resp.id;
      })
    );
  }


  private buildTemplate(source: RespListingTemplate, marketPort?: number): ListingTemplate {
    const itemInfo = source.ItemInformation;

    const paymentInfo = source.PaymentInformation ? source.PaymentInformation : null;

    const itemPrice = paymentInfo && paymentInfo.ItemPrice ? source.PaymentInformation.ItemPrice : null;
    const shippingPrice = itemPrice && itemPrice.ShippingPrice ? itemPrice.ShippingPrice : null;
    const basePrice = (itemPrice && +itemPrice.basePrice) || 0;
    const shipLocal = (shippingPrice && +shippingPrice.domestic) || 0;
    const shipIntl = (shippingPrice && +shippingPrice.international) || 0;

    const sourceHasListings = (source.ListingItems || []).length > 0;
    const sourceHash = source.hash || '';

    let sourceStatus: TEMPLATE_STATUS_TYPE;
    switch (true) {
      // TODO zaSmilingIdiot 2020-05-26 -> Add in Expired case here as well
      //    (requires knowing what the listing item expiry field is, which is not known at the time of this comment)
      case (sourceHash.length > 0) && sourceHasListings: sourceStatus = TEMPLATE_STATUS_TYPE.PUBLISHED; break;
      case (sourceHash.length > 0) && !sourceHasListings: sourceStatus = TEMPLATE_STATUS_TYPE.PENDING; break;
      default: sourceStatus = TEMPLATE_STATUS_TYPE.UNPUBLISHED;
    }

    const templ: ListingTemplate = {
      id: source.id,
      profileId: source.profileId,
      hash: sourceHash,
      information: {
        id: itemInfo.id,
        title: itemInfo.title,
        summary: itemInfo.shortDescription,
        description: itemInfo.longDescription
      },
      location: {
        id: (itemInfo && itemInfo.ItemLocation && +itemInfo.ItemLocation.id) || 0,
        countryCode: (itemInfo && itemInfo.ItemLocation && itemInfo.ItemLocation.country) || '',
      },
      shippingDestinations: (itemInfo.ShippingDestinations || []).map(d => {
        const dest: TemplateShippingDestination = {
          id: d.id,
          type: d.shippingAvailability,
          countryCode: d.country
        };
        return dest;
      }),
      images: (itemInfo.ItemImages || []).map(value => {
        const img: TemplateImage = {
          id: +value.id,
          featured: !!value.featured,
          versions: (value.ItemImageDatas || []).map(iid => {
            return {
              id: iid.id,
              version: iid.imageVersion,
              url: marketPort ? this.formatImagePath(iid.dataId || '', marketPort) : iid.dataId,
              data: iid.data
            };
          })
        };
        return img;
      }),
      payment: {
        id: (paymentInfo && +paymentInfo.id) || 0,
        type: (paymentInfo && paymentInfo.type) || null,
        escrow: {
          type: (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.type) || null,
          buyerRatio: (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.Ratio && paymentInfo.Escrow.Ratio.buyer) || null,
          sellerRatio: (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.Ratio && paymentInfo.Escrow.Ratio.seller) || null
        }
      },
      price: {
        id: (itemPrice && +itemPrice.id) || 0,
        currency: (itemPrice && itemPrice.currency) || null,
        basePrice: new PartoshiAmount(basePrice * Math.pow(10, 8)),
        shippingLocal: new PartoshiAmount(shipLocal * Math.pow(10, 8)),
        shippingInternational: new PartoshiAmount(shipIntl * Math.pow(10, 8))
      },
      hasLinkedListings: sourceHasListings,
      status: sourceStatus,
      created: source.createdAt,
      updated: source.updatedAt
    };

    return templ;
  }


  private formatImagePath(path: string, port: number): string {
    const pathparts = path.split(':');

    if (pathparts.length !== 3) {
      return path;
    }

    let final = pathparts[2];
    const remainder = pathparts[2].split('/');
    if ((typeof +remainder[0] === 'number') && +remainder[0]) {
      final = remainder.slice(1).join('/');
    }
    return `${[pathparts[0], pathparts[1], String(port)].join(':')}/${final}`;
  }

}
