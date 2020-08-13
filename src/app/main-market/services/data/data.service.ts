import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, retryWhen } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { RegionListService } from '../region-list/region-list.service';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RespCategoryList, RespMarketListMarketItem, RespListingItem } from '../../shared/market.models';
import { ListingItemDetail } from '../../shared/listing-detail-modal/listing-detail.models';
import { formatImagePath, getValueOrDefault, isBasicObjectType } from '../../shared/utils';
import { CategoryItem, Market } from './data.models';


@Injectable()
export class DataService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _regionService: RegionListService,
  ) {}


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

    return this._rpc.call('market', ['list', profileId]).pipe(
      retryWhen(genericPollingRetryStrategy()),
      map((marketsReq: RespMarketListMarketItem[]) => {
        const filteredMarkets: Market[] = [];
        for (const market of marketsReq) {
          if ( !identityId || (market.identityId === identityId) ) {
            filteredMarkets.push({
              id: +market.id,
              name: market.name,
              type: market.type,
              receiveAddress: market.receiveAddress,
              identityId: +market.identityId});
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
    const item = {
      id: category.id,
      name: category.name,
      children: []
    };

    if (Object.prototype.toString.call(category.ChildItemCategories) === '[object Array]') {
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
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
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
        favouriteId = 0,
        shippingDestinations = [] as {code: string, name: string}[];

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
      const codes = [];

      if (isBasicObjectType(fromDetails.ItemLocation)) {
        shippingLocation.code = getValueOrDefault(fromDetails.ItemLocation.country, 'string', shippingLocation.code);
        codes.push(shippingLocation.code);
      }

      if (Object.prototype.toString.call(fromDetails.ShippingDestinations) === '[object Array]') {
        fromDetails.ShippingDestinations.forEach((shipping) => {
          if ((getValueOrDefault(shipping.country, 'string', '') !== '') && (shipping.shippingAvailability === 'SHIPS')) {
            codes.push(shipping.country);
          }
        });
      }

      const locations = this._regionService.findCountriesByIsoCodes(codes);

      if (locations.length && (locations[0].iso === shippingLocation.code)) {
        let source = locations[0];
        if (codes.filter(c => c === shippingLocation.code).length === 1) {
          source = locations.shift();
        }
        shippingLocation.name = source.name;
      }

      shippingDestinations = locations.map(l => ({code: l.iso, name: l.name}));

      // category
      if (isBasicObjectType(fromDetails.ItemCategory)) {
        category.id = getValueOrDefault(fromDetails.ItemCategory.id, 'number', category.id);
        category.title = getValueOrDefault(fromDetails.ItemCategory.name, 'string', category.title);
      }

      // images
      if (Object.prototype.toString.call(fromDetails.ItemImages) === '[object Array]') {
        fromDetails.ItemImages.forEach(img => {
          if (img.featured) {
            images.featured = images.images.length;
          }
          let thumbUrl = '';
          let imgUrl = '';

          if (Object.prototype.toString.call(img.ItemImageDatas) === '[object Array]') {
            img.ItemImageDatas.forEach(d => {
              if (d.imageVersion) {
                if (d.imageVersion === 'MEDIUM' && getValueOrDefault(d.dataId, 'string', imgUrl)) { imgUrl = d.dataId; }
                if (d.imageVersion === 'THUMBNAIL' && getValueOrDefault(d.dataId, 'string', thumbUrl)) { thumbUrl = d.dataId; }
              }
            });
          }

          if (thumbUrl && imgUrl) {
            images.images.push({
              IMAGE: formatImagePath(imgUrl, marketSettings.port),
              THUMBNAIL: formatImagePath(thumbUrl, marketSettings.port)
            });
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

    if (Object.prototype.toString.call(from.FavoriteItems) === '[object Array]') {

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
