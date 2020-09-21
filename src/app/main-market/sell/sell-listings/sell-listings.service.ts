import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { isBasicObjectType, getValueOrDefault, parseImagePath } from 'app/main-market/shared/utils';
import { RespListingTemplate } from '../../shared/market.models';
import { SellListing } from './sell-listings.models';


@Injectable()
export class SellListingsService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  fetchAllListings(): Observable<SellListing[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('template', ['search', 0, 1000000, 'DESC', 'created_at', profileId]).pipe(
      map((resp: RespListingTemplate[]) => {
        return this.buildListings(resp);
      })
    );
  }


  private buildListings(templateList: RespListingTemplate[]): SellListing[] {
    // So why this complicated route?
    // Because we need such details as which Base Template the listing refers to, or
    //    which parent Market Template (if applicable) it refers to, etc
    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
    const actualListings: SellListing[] = [];

    const marketTemplMap: Map<number, RespListingTemplate> = new Map();
    const baseTemplList: RespListingTemplate[] = [];

    templateList.forEach(templ => {
      if (isBasicObjectType(templ) && (+templ.id > 0)) {
        if (+templ.parentListingItemTemplateId > 0) {
          // is market template
          marketTemplMap.set(+templ.id, templ);
        } else {
          // is base template
          baseTemplList.push(templ);
        }
      }
    });

    baseTemplList.forEach(baseTempl => {
      if (Array.isArray(baseTempl.ChildListingItemTemplates)) {
        baseTempl.ChildListingItemTemplates.forEach(basicMarketTempl => {
          const rootMarketTempl = marketTemplMap.get(+basicMarketTempl.id);

          if (rootMarketTempl && (+rootMarketTempl.id > 0)) {

            // process any "root" market template listings
            if (Array.isArray(rootMarketTempl.ListingItems)) {
              const listingItems = this.buildListingItemsFromTemplate(rootMarketTempl, baseTempl.id, marketUrl);
              actualListings.push(...listingItems);
            }

            // process any "child" market template listings
            if (Array.isArray(rootMarketTempl.ChildListingItemTemplates)) {
              rootMarketTempl.ChildListingItemTemplates.forEach(childTempl => {
                const childMarketTemplate = marketTemplMap.get(+childTempl.id);

                if (childMarketTemplate && (+childMarketTemplate.id > 0)) {
                  const listingItems = this.buildListingItemsFromTemplate(childMarketTemplate, baseTempl.id, marketUrl);
                  actualListings.push(...listingItems);
                }
              });
            }
          }
        });
      }
    });

    return actualListings;
  }


  private buildListingItemsFromTemplate(marketTemplate: RespListingTemplate, rootTemplateId: number, marketUrl: string): SellListing[] {

    const now = Date.now();
    const listings: SellListing[] = [];
    const defaultImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;

    if (marketTemplate && Array.isArray(marketTemplate.ListingItems)) {
      marketTemplate.ListingItems.forEach(src => {

        const newListing: SellListing = {
          idBaseTemplate: rootTemplateId,
          idMarketTemplate: 0,
          listingId: 0,
          title: '',
          summary: '',
          image: defaultImage,
          marketKey: '',
          categoryName: '',
          status: '',
          created: 0,
          updated: 0,
          expires: 0,
          shippingSource: '',
          priceBase: '',
          priceShippingLocal: '',
          priceShippingIntl: ''
        };


        if (isBasicObjectType(src)) {
          newListing.idMarketTemplate = getValueOrDefault(src.listingItemTemplateId, 'number', newListing.idMarketTemplate);
          newListing.listingId = getValueOrDefault(src.id, 'number', newListing.listingId);
          newListing.created = getValueOrDefault(src.createdAt, 'number', newListing.created);
          newListing.updated = getValueOrDefault(src.updatedAt, 'number', newListing.updated);
          newListing.expires = getValueOrDefault(src.expiredAt, 'number', newListing.expires);

          newListing.status = newListing.expires > now ? 'ACTIVE' : 'EXPIRED';

          if (isBasicObjectType(src.ItemInformation)) {
            newListing.title = getValueOrDefault(src.ItemInformation.title, 'string', newListing.title);
            newListing.summary = getValueOrDefault(src.ItemInformation.shortDescription, 'string', newListing.summary);

            if (Array.isArray(src.ItemInformation.Images) && src.ItemInformation.Images.length) {
              let featured = src.ItemInformation.Images.find(img => img.featured);
              if (featured === undefined) {
                featured = src.ItemInformation.Images[0];
              }

              newListing.image = parseImagePath(featured, 'THUMBNAIL', marketUrl) || newListing.image;
            }

            if (isBasicObjectType(src.ItemInformation.ItemLocation)) {
              newListing.shippingSource = getValueOrDefault(src.ItemInformation.ItemLocation.country, 'string', newListing.shippingSource);
            }

            if (isBasicObjectType(src.ItemInformation.ItemCategory)) {
              newListing.categoryName = getValueOrDefault(src.ItemInformation.ItemCategory.description, 'string', newListing.categoryName);
            }

            newListing.marketKey = getValueOrDefault(src.market, 'string', newListing.marketKey);
          }

          if (isBasicObjectType(src.PaymentInformation) && isBasicObjectType(src.PaymentInformation.ItemPrice)) {
            const basePrice = new PartoshiAmount(src.PaymentInformation.ItemPrice.basePrice, true);
            newListing.priceBase = basePrice.particlsString();

            if (isBasicObjectType(src.PaymentInformation.ItemPrice.ShippingPrice)) {
              const localShip = new PartoshiAmount(src.PaymentInformation.ItemPrice.ShippingPrice.domestic, true);
              newListing.priceShippingLocal = localShip.particlsString();

              const intlShip = new PartoshiAmount(src.PaymentInformation.ItemPrice.ShippingPrice.international, true);
              newListing.priceShippingIntl = intlShip.particlsString();
            }
          }
        }


        if ((newListing.listingId > 0) && (newListing.listingId > 0)) {
          listings.push(newListing);
        }

      });
    }

    return listings;
  }

}
