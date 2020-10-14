import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, retryWhen } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { RegionListService } from '../region-list/region-list.service';

import * as marketConfig from '../../../../../modules/market/config.js';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../../shared/utils';
import { RespCategoryList, RespMarketListMarketItem, RespListingItem } from '../../shared/market.models';
import { ListingItemDetail } from '../../shared/listing-detail-modal/listing-detail.models';
import { CategoryItem, Market } from './data.models';


enum TextContent {
  OPEN_MARKET_NAME = 'Open Marketplace'
}


@Injectable()
export class DataService {

  private marketAddresses: string[];
  private defaultMarketImage: string;

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _regionService: RegionListService,
  ) {
    if (isBasicObjectType(marketConfig.addressesOpenMarketplace)) {
      this.marketAddresses = Object.keys(marketConfig.addressesOpenMarketplace);
    }

    this.defaultMarketImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
  }


  loadCategories(marketId?: number): Observable<{categories: CategoryItem[]; rootId: number}> {
    return this._rpc.call('category', ['list', marketId]).pipe(
      map((category: RespCategoryList) => {
        const parsed = this.parseCategories(category);
        return {categories: parsed.children, rootId: category.id};
      })
    );
  }


  loadMarkets(identityId?: number): Observable<Market[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;

    return this._rpc.call('market', ['list', profileId]).pipe(
      retryWhen(genericPollingRetryStrategy()),
      map((marketsReq: RespMarketListMarketItem[]) => {
        const filteredMarkets: Market[] = [];
        for (const market of marketsReq) {
          if ( !identityId || (market.identityId === identityId) ) {

            let marketImg = this.defaultMarketImage;
            if (isBasicObjectType(market.Image) && Array.isArray(market.Image.ImageDatas)) {
              marketImg = parseImagePath(market.Image, 'ORIGINAL', marketUrl) || marketImg;
            }

            filteredMarkets.push({
              id: +market.id,
              name: this.marketAddresses.includes(market.receiveAddress) ? TextContent.OPEN_MARKET_NAME : market.name,
              type: market.type,
              receiveAddress: market.receiveAddress,
              publishAddress: market.publishAddress,
              identityId: +market.identityId,
              image: marketImg
            });
          }
        }
        return filteredMarkets;
      })
    );
  }


  getListingDetailsForMarket(id: number, marketId: number): Observable<ListingItemDetail> {
    return this._rpc.call('item', ['get', id, true]).pipe(
      map((resp: RespListingItem) => this.createListingItemDetail(resp, marketId))
    );
  }


  private parseCategories(category: RespCategoryList, marketKey: string = ''): CategoryItem {
    const item: CategoryItem = {
      id: category.id,
      name: category.name,
      children: []
    };

    if (Array.isArray(category.ChildItemCategories)) {
      item.children = category.ChildItemCategories.reduce<CategoryItem[]>((acc: CategoryItem[], childItem: RespCategoryList) => {
        if (!marketKey || (childItem.market === marketKey)) {
          return acc.concat(this.parseCategories(childItem));
        }
        return acc;
      }, []);
    }

    return item;
  }


  private createListingItemDetail(from: RespListingItem, marketId: number): ListingItemDetail {
    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;

    let title = '',
        summary = '',
        description = '',
        basePrice = 0,
        shipLocal = 0,
        shipIntl = 0,
        escrowSeller = 100,
        escrowBuyer = 100,
        flaggedHash = '',
        favouriteId = 0;

    const shippingDestinations = [] as {code: string, name: string}[];
    const shippingLocation = { code: '', name: ''};
    const category = { id: 0, title: '' };
    const images = { featured: 0, images: [] as {THUMBNAIL: string, IMAGE: string}[] };

    const fromDetails = from.ItemInformation;

    if (isBasicObjectType(fromDetails)) {
      // basic info
      title = getValueOrDefault(fromDetails.title, 'string', title);
      summary = getValueOrDefault(fromDetails.shortDescription, 'string', summary);
      description = getValueOrDefault(fromDetails.longDescription, 'string', description);

      // shipping source and destinations
      const countryCodes: string[] = [];
      let sourceCountryCode = '';

      if (isBasicObjectType(fromDetails.ItemLocation)) {
        sourceCountryCode = getValueOrDefault(fromDetails.ItemLocation.country, 'string', shippingLocation.code);
        if (sourceCountryCode.length) {
          countryCodes.push(sourceCountryCode);
        }
      }

      if (Array.isArray(fromDetails.ShippingDestinations)) {
        fromDetails.ShippingDestinations.forEach((shipping) => {
          if ((getValueOrDefault(shipping.country, 'string', '') !== '') && (shipping.shippingAvailability === 'SHIPS')) {
            countryCodes.push(shipping.country);
          }
        });
      }

      const locations = this._regionService.findCountriesByIsoCodes(countryCodes);
      const sourceCountryIdx = locations.findIndex(c => c.iso === sourceCountryCode);

      if (sourceCountryIdx > -1) {
        shippingLocation.code = locations[sourceCountryIdx].iso;
        shippingLocation.name = locations[sourceCountryIdx].name;
        const sourceIdx = countryCodes.findIndex(cc => cc === sourceCountryCode);
        countryCodes.splice(sourceIdx, 1);
      }

      countryCodes.forEach(cc => {
        const country = locations.find(c => c.iso === cc);
        if (country) {
          shippingDestinations.push({code: country.iso, name: country.name});
        }
      });

      // category
      if (isBasicObjectType(fromDetails.ItemCategory)) {
        category.id = getValueOrDefault(fromDetails.ItemCategory.id, 'number', category.id);
        category.title = getValueOrDefault(fromDetails.ItemCategory.name, 'string', category.title);
      }

      // images
      if (Array.isArray(fromDetails.Images)) {
        fromDetails.Images.forEach(img => {
          const thumbUrl = parseImagePath(img, 'MEDIUM', marketUrl);
          const imgUrl = parseImagePath(img, 'LARGE', marketUrl);

          if (thumbUrl && imgUrl) {
            images.images.push({
              THUMBNAIL: thumbUrl,
              IMAGE: imgUrl
            });

            if (img.featured) {
              images.featured = images.images.length - 1;
            }
          }
        });
      }
    }

    const priceInfo = from.PaymentInformation;

    if (isBasicObjectType(priceInfo)) {
      if (isBasicObjectType(priceInfo.ItemPrice)) {
        basePrice = getValueOrDefault(priceInfo.ItemPrice.basePrice, 'number', 0);

        if (isBasicObjectType(priceInfo.ItemPrice.ShippingPrice)) {
          shipLocal = getValueOrDefault(priceInfo.ItemPrice.ShippingPrice.domestic, 'number', shipLocal);
          shipIntl = getValueOrDefault(priceInfo.ItemPrice.ShippingPrice.international, 'number', shipIntl);
        }
      }

      if (isBasicObjectType(priceInfo.Escrow)) {
        if (isBasicObjectType(priceInfo.Escrow.Ratio)) {
          escrowBuyer = getValueOrDefault(priceInfo.Escrow.Ratio.buyer, 'number', escrowBuyer);
          escrowSeller = getValueOrDefault(priceInfo.Escrow.Ratio.seller, 'number', escrowSeller);
        }
      }
    }

    if (isBasicObjectType(from.FlaggedItem) && isBasicObjectType(from.FlaggedItem.Proposal)) {
      flaggedHash = getValueOrDefault(from.FlaggedItem.Proposal.hash, 'string', flaggedHash);
    }

    if (Array.isArray(from.FavoriteItems)) {

      for (let ii = 0; ii < from.FavoriteItems.length; ii++) {
        if (from.FavoriteItems[ii].profileId === profileId) {
          favouriteId = from.FavoriteItems[ii].id;
          break;
        }
      }
    }


    const itemDetail: ListingItemDetail = {
      id: getValueOrDefault(from.id, 'number', 0),
      marketId: marketId,
      hash: getValueOrDefault(from.hash, 'string', ''),
      title: title,
      summary: summary,
      description: description,
      seller: getValueOrDefault(from.seller, 'string', ''),
      price: {
        base: basePrice,
        shippingDomestic: shipLocal,
        shippingIntl: shipIntl
      },
      escrow: {
        buyerRatio: escrowBuyer,
        sellerRatio: escrowSeller
      },
      shippingFrom: shippingLocation,
      shippingTo: shippingDestinations,
      category: category,
      images: images,
      timeData: {
        created: getValueOrDefault(from.postedAt, 'number', 0),
        expires: getValueOrDefault(from.expiredAt, 'number', 0)
      },
      extra: {
        flaggedProposal: flaggedHash,
        favouriteId: favouriteId,
        isOwn: isBasicObjectType(from.ListingItemTemplate) && (+from.ListingItemTemplate.id > 0),
      }

    };

    return itemDetail;
  }

}
