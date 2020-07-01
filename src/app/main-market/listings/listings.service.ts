import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';

import { MarketState } from '../store/market.state';

import { PartoshiAmount } from 'app/core/util/utils';
import { RespListingItem } from '../shared/market.models';
import { ListingOverviewItem } from './listings.models';
import { MarketSettings } from '../store/market.models';


@Injectable()
export class ListingsService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  searchListingItems(
    market: string,
    page: number,
    count: number,
    searchTerm: string = '',
    categories: string[] = [],
    seller: string = '',
    sourceCountry: string = '',
    destinationCountry: string = '',
    isFlagged: boolean = false
  ): Observable<ListingOverviewItem[]> {
    const params: any[] = [
      page,
      count,
      'DESC',
      'created_at',
      market,
      categories || null,
      seller || null,
      null,
      null,
      sourceCountry || null,
      destinationCountry || null,
      searchTerm || '*',
      isFlagged
    ];

    return this._rpc.call('item', ['search', ...params]).pipe(
      map((resp: RespListingItem[]) => {
        const marketSettings = this._store.selectSnapshot(MarketState.settings);
        return resp.map((item) => this.createOverviewItem(item, marketSettings));
      })
    );
  }


  private createOverviewItem(from: RespListingItem, marketSettings: MarketSettings): ListingOverviewItem {
    let listingId = 0,
        title = '',
        summary = '',
        listingSeller = '',
        imageSelected = './assets/images/placeholder_4-3.jpg',
        isLocalShipping = false,
        isOwnListing = false,
        commentCount = 0;
    const price = new PartoshiAmount(0);

    const fromDetails = from.ItemInformation;

    if ((typeof fromDetails === 'object') && !!fromDetails) {

      // Set item information values
      title = this.getValueOrDefault(fromDetails.title, 'string', title);
      summary = this.getValueOrDefault(fromDetails.shortDescription, 'string', summary);

      listingId = this.getValueOrDefault(from.id, 'number', 0);
      listingSeller = this.getValueOrDefault(from.seller, 'string', '');

      if ((typeof fromDetails.ItemLocation === 'object') && !!fromDetails.ItemLocation) {
        isLocalShipping = marketSettings.userRegion === this.getValueOrDefault(fromDetails.ItemLocation.country, 'string', '');
      }

      // Image selection and processing
      if (Object.prototype.toString.call(fromDetails.ItemImages) === '[object Array]') {
        if (fromDetails.ItemImages.length) {
          let featured = fromDetails.ItemImages.find(img => img.featured);
          if (featured === undefined) {
            featured = fromDetails.ItemImages[0];
          }

          const imgDatas = Object.prototype.toString.call(featured.ItemImageDatas) === '[object Array]' ? featured.ItemImageDatas : [];
          const selected = imgDatas.find(d => d.imageVersion && d.imageVersion === 'MEDIUM');
          if (selected) {
            imageSelected = this.formatImagePath(
              this.getValueOrDefault(selected.dataId, 'string', ''), marketSettings.port) || imageSelected;
          }
        }
      }
    }

    // Calculate price value to be displayed
    const priceInfo = from.PaymentInformation;

    if ((typeof priceInfo === 'object') && !!priceInfo) {
      if ((typeof priceInfo.ItemPrice === 'object') && !!priceInfo.ItemPrice) {
        price.add(new PartoshiAmount(priceInfo.ItemPrice.basePrice, true));

        if (marketSettings.userRegion.length > 0) {
          if (isLocalShipping) {
            price.add( new PartoshiAmount(priceInfo.ItemPrice.ShippingPrice.domestic, true) );
          } else {
            price.add( new PartoshiAmount(priceInfo.ItemPrice.ShippingPrice.international, true) );
          }
        }
      }
    }

    // Process extra info
    isOwnListing = (typeof from.ListingItemTemplate === 'object') && (+from.ListingItemTemplate.id > 0);
    commentCount = Object.prototype.toString.call(from.MessagingInformation) === '[object Array]' ?
        from.MessagingInformation.length : 0;


    const newItem: ListingOverviewItem = {
      id: listingId,
      title: title,
      summary: summary,
      hash: this.getValueOrDefault(from.hash, 'string', ''),
      seller: listingSeller,
      expiry: this.getValueOrDefault(from.expiryTime, 'number', 0),
      image: imageSelected,
      price: {
        whole: price.particlStringInteger(),
        sep: price.particlStringSep(),
        decimal: price.particlStringFraction()
      },
      extras: {
        commentCount: commentCount,
        isFavourited: false,
        isFlagged: typeof from.FlaggedItem === 'object' && !!from.FlaggedItem,
        usersVote: false,
        isOwn: isOwnListing,
        canAddToCart: !isOwnListing
      }
    };

    return newItem;
  }


  private getValueOrDefault<T>(value: T, type: 'string' | 'number' | 'boolean', defaultValue: T): T {
    return typeof value === type ? value : defaultValue;
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
