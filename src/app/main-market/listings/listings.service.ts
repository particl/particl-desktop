import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, mapTo, catchError } from 'rxjs/operators';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { RegionListService } from '../services/region-list/region-list.service';

import { MarketState } from '../store/market.state';

import { PartoshiAmount } from 'app/core/util/utils';
import { RespListingItem } from '../shared/market.models';
import { ListingOverviewItem } from './listings.models';
import { MarketSettings } from '../store/market.models';
import { ListingItemDetail } from '../shared/shared.models';


@Injectable()
export class ListingsService {

  constructor(
    private _rpc: MarketRpcService,
    private _regionService: RegionListService,
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
        const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
        return resp.map((item) => this.createOverviewItem(item, profileId, marketSettings));
      })
    );
  }


  getListingDetails(id: number): Observable<ListingItemDetail> {
    return this._rpc.call('item', ['get', id, true]).pipe(
      map((resp: RespListingItem) => this.createListingItemDetail(resp))
    );
  }


  addFavourite(profileId: number, listingId: number): Observable<number | null> {
    return this._rpc.call('favorite', ['add', profileId, listingId]).pipe(
      map(item => item.id),
      catchError(() => of(null)),
    );
  }


  removeFavourite(favouriteId: number): Observable<boolean> {
    return this._rpc.call('favorite', ['remove', favouriteId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  private createOverviewItem(from: RespListingItem, profileId: number, marketSettings: MarketSettings): ListingOverviewItem {
    let listingId = 0,
        title = '',
        summary = '',
        listingSeller = '',
        imageSelected = './assets/images/placeholder_4-3.jpg',
        isLocalShipping = false,
        isOwnListing = false,
        favId = null,
        commentCount = 0;
    const price = new PartoshiAmount(0);

    const fromDetails = from.ItemInformation;

    if (this.isBasicObjectType(fromDetails)) {

      // Set item information values
      title = this.getValueOrDefault(fromDetails.title, 'string', title);
      summary = this.getValueOrDefault(fromDetails.shortDescription, 'string', summary);

      listingId = this.getValueOrDefault(from.id, 'number', 0);
      listingSeller = this.getValueOrDefault(from.seller, 'string', '');

      if (this.isBasicObjectType(fromDetails.ItemLocation)) {
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

    if (this.isBasicObjectType(priceInfo)) {
      if (this.isBasicObjectType(priceInfo.ItemPrice)) {
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

    // Favourite?
    if (Object.prototype.toString.call(from.FavoriteItems) === '[object Array]') {

      for (let ii = 0; ii < from.FavoriteItems.length; ii++) {
        favId = from.FavoriteItems[ii].profileId === profileId ? from.FavoriteItems[ii].id : favId;
        if (favId) { break; }
      }
    }

    // Process extra info
    isOwnListing = this.isBasicObjectType(from.ListingItemTemplate) && (+from.ListingItemTemplate.id > 0);
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
        favouriteId: favId,
        isFlagged: this.isBasicObjectType(from.FlaggedItem),
        usersVote: false,
        isOwn: isOwnListing,
        canAddToCart: !isOwnListing
      }
    };

    return newItem;
  }


  private createListingItemDetail(from: RespListingItem): ListingItemDetail {
    const marketSettings = this._store.selectSnapshot(MarketState.settings);

    let title = '',
        summary = '',
        description = '',
        basePrice = 0,
        shipLocal = 0,
        shipIntl = 0,
        escrowSeller = 100,
        escrowBuyer = 100,
        shippingDestinations = [] as {code: string, name: string}[];

    const shippingLocation = { code: '', name: ''};
    const category = { id: 0, title: '' };
    const images = { featured: 0, images: [] as {THUMBNAIL: string, IMAGE: string}[] };

    const fromDetails = from.ItemInformation;

    if (this.isBasicObjectType(fromDetails)) {
      // basic info
      title = this.getValueOrDefault(fromDetails.title, 'string', title);
      summary = this.getValueOrDefault(fromDetails.shortDescription, 'string', summary);
      description = this.getValueOrDefault(fromDetails.longDescription, 'string', description);

      // shipping source and destinations
      const codes = [];

      if (this.isBasicObjectType(fromDetails.ItemLocation)) {
        shippingLocation.code = this.getValueOrDefault(fromDetails.ItemLocation.country, 'string', shippingLocation.code);
        codes.push(shippingLocation.code);
      }

      if (Object.prototype.toString.call(fromDetails.ShippingDestinations) === '[object Array]') {
        fromDetails.ShippingDestinations.forEach((shipping) => {
          if ((this.getValueOrDefault(shipping.country, 'string', '') !== '') && (shipping.shippingAvailability === 'SHIPS')) {
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
      if (this.isBasicObjectType(fromDetails.ItemCategory)) {
        category.id = this.getValueOrDefault(fromDetails.ItemCategory.id, 'number', category.id);
        category.title = this.getValueOrDefault(fromDetails.ItemCategory.name, 'string', category.title);
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
                if (d.imageVersion === 'MEDIUM' && this.getValueOrDefault(d.dataId, 'string', imgUrl)) { imgUrl = d.dataId; }
                if (d.imageVersion === 'THUMBNAIL' && this.getValueOrDefault(d.dataId, 'string', thumbUrl)) { thumbUrl = d.dataId; }
              }
            });
          }

          if (thumbUrl && imgUrl) {
            images.images.push({
              IMAGE: this.formatImagePath(imgUrl, marketSettings.port),
              THUMBNAIL: this.formatImagePath(thumbUrl, marketSettings.port)
            });
          }
        });
      }
    }

    const priceInfo = from.PaymentInformation;

    if (this.isBasicObjectType(priceInfo)) {
      if (this.isBasicObjectType(priceInfo.ItemPrice)) {
        basePrice = this.getValueOrDefault(priceInfo.ItemPrice.basePrice, 'number', 0);

        if (this.isBasicObjectType(priceInfo.ItemPrice.ShippingPrice)) {
          shipLocal = this.getValueOrDefault(priceInfo.ItemPrice.ShippingPrice.domestic, 'number', shipLocal);
          shipIntl = this.getValueOrDefault(priceInfo.ItemPrice.ShippingPrice.international, 'number', shipIntl);
        }
      }

      if (this.isBasicObjectType(priceInfo.Escrow)) {
        if (this.isBasicObjectType(priceInfo.Escrow.Ratio)) {
          escrowBuyer = this.getValueOrDefault(priceInfo.Escrow.Ratio.buyer, 'number', escrowBuyer);
          escrowSeller = this.getValueOrDefault(priceInfo.Escrow.Ratio.seller, 'number', escrowSeller);
        }
      }
    }


    const itemDetail: ListingItemDetail = {
      id: this.getValueOrDefault(from.id, 'number', 0),
      hash: this.getValueOrDefault(from.hash, 'string', ''),
      title: title,
      summary: summary,
      description: description,
      seller: this.getValueOrDefault(from.seller, 'string', ''),
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
        created: this.getValueOrDefault(from.postedAt, 'number', 0),
        expires: this.getValueOrDefault(from.expiredAt, 'number', 0)
      },
      extra: {
        isFlagged: this.isBasicObjectType(from.FlaggedItem),
        isOwn: this.isBasicObjectType(from.ListingItemTemplate) && (+from.ListingItemTemplate.id > 0),
        vote: {}   // TODO: implement details when known
      }

    };

    return itemDetail;
  }


  private getValueOrDefault<T>(value: T, type: 'string' | 'number' | 'boolean', defaultValue: T): T {
    return typeof value === type ? value : defaultValue;
  }


  private isBasicObjectType(value: any): boolean {
    return (typeof value === 'object') && !!value;
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
