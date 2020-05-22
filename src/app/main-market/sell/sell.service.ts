import { Injectable } from '@angular/core';
import { Observable, of, throwError, from } from 'rxjs';
import { map, concatMap, mapTo, catchError, last, concatAll } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { NewTemplateData, ListingTemplate, TemplateShippingDestination, TemplateImage, UpdateTemplateData } from './sell.models';
import { RespListingTemplate, RespCategoryAdd, RespTemplateSize } from '../shared/market.models';


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
  ): Observable<any> {

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

    const templ: ListingTemplate = {
      id: source.id,
      profileId: source.profileId,
      hash: source.hash,
      information: {
        id: itemInfo.id,
        title: itemInfo.title,
        summary: itemInfo.shortDescription,
        description: itemInfo.longDescription
      },
      location: {
        id: (itemInfo && itemInfo.ItemLocation && +itemInfo.ItemLocation.id) || null,
        countryCode: (itemInfo && itemInfo.ItemLocation && itemInfo.ItemLocation.country) || null,
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
        id: (paymentInfo && +paymentInfo.id) || null,
        type: (paymentInfo && paymentInfo.type) || null,
        escrow: {
          type: (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.type) || null,
          buyerRatio: (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.Ratio && paymentInfo.Escrow.Ratio.buyer) || null,
          sellerRatio: (paymentInfo && paymentInfo.Escrow && paymentInfo.Escrow.Ratio && paymentInfo.Escrow.Ratio.seller) || null
        }
      },
      price: {
        id: (itemPrice && +itemPrice.id) || null,
        currency: (itemPrice && itemPrice.currency) || null,
        basePrice: new PartoshiAmount(basePrice * Math.pow(10, 8)),
        shippingLocal: new PartoshiAmount(shipLocal * Math.pow(10, 8)),
        shippingInternational: new PartoshiAmount(shipIntl * Math.pow(10, 8))
      },
      hasLinkedListings: (source.ListingItems || []).length > 0
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
