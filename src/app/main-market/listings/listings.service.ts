import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mapTo, catchError, filter } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { MarketSocketService } from '../services/market-rpc/market-socket.service';

import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';
import { RespListingItem, RespCartItemAdd, RespItemFlag } from '../shared/market.models';
import { ListingOverviewItem } from './listings.models';
import { MarketSettings } from '../store/market.models';
import { SocketMessages_v03 } from '../shared/market-socket.models';


@Injectable()
export class ListingsService {

  constructor(
    private _rpc: MarketRpcService,
    private _socket: MarketSocketService,
    private _store: Store
  ) {}


  getListenerNewListings(): Observable<SocketMessages_v03.AddListing> {
    return this._socket.getSocketMessageListener('MPA_LISTING_ADD_03');
  }


  getListenerFlaggedItems(): Observable<SocketMessages_v03.ProposalAdded> {
    return this._socket.getSocketMessageListener('MPA_PROPOSAL_ADD').pipe(
      filter((msg) => msg && (msg.category === 'ITEM_VOTE'))
    );
  }

  getListenerComments(): Observable<SocketMessages_v03.CommentAdded> {
    return this._socket.getSocketMessageListener('MPA_COMMENT_ADD').pipe(
      filter((msg) => msg && (typeof msg.commentType === 'string') && (msg.commentType === 'LISTINGITEM_QUESTION_AND_ANSWERS'))
    );
  }



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
        const defaultImagePath = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
        const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
        return resp.map((item) => this.createOverviewItem(item, profileId, marketSettings, defaultImagePath));
      })
    );
  }


  addFavourite(listingId: number): Observable<number | null> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
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


  reportItem(listingId: number): Observable<boolean> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('item', ['flag', listingId, identityId]).pipe(
      map((resp: RespItemFlag) => {
        return resp && resp.result && String(resp.result).toLowerCase() === 'sent.';
      })
    );
  }


  addItemToCart(listingId: number, cartId: number): Observable<RespCartItemAdd> {
    return this._rpc.call('cartitem', ['add', cartId, listingId]);
  }


  private createOverviewItem(
    from: RespListingItem, profileId: number, marketSettings: MarketSettings, defaultImage: string
  ): ListingOverviewItem {
    let listingId = 0,
        title = '',
        summary = '',
        listingSeller = '',
        imageSelected = defaultImage,
        isLocalShipping = false,
        isOwnListing = false,
        favId = 0,
        commentCount = 0;
    const price = new PartoshiAmount(0);

    const fromDetails = from.ItemInformation;

    if (isBasicObjectType(fromDetails)) {

      // Set item information values
      title = getValueOrDefault(fromDetails.title, 'string', title);
      summary = getValueOrDefault(fromDetails.shortDescription, 'string', summary);

      listingId = getValueOrDefault(from.id, 'number', 0);
      listingSeller = getValueOrDefault(from.seller, 'string', '');

      if (isBasicObjectType(fromDetails.ItemLocation)) {
        isLocalShipping = marketSettings.userRegion === getValueOrDefault(fromDetails.ItemLocation.country, 'string', '');
      }

      // Image selection and processing
      if (Array.isArray(fromDetails.Images)) {
        if (fromDetails.Images.length) {
          let featured = fromDetails.Images.find(img => img.featured);
          if (featured === undefined) {
            featured = fromDetails.Images[0];
          }
          imageSelected = parseImagePath(featured, 'MEDIUM', marketSettings.port) || imageSelected;
        }
      }
    }

    // Calculate price value to be displayed
    const priceInfo = from.PaymentInformation;

    if (isBasicObjectType(priceInfo)) {
      if (isBasicObjectType(priceInfo.ItemPrice)) {
        price.add(new PartoshiAmount(priceInfo.ItemPrice.basePrice, true));

        if ((marketSettings.userRegion.length > 0) && isBasicObjectType(priceInfo.ItemPrice.ShippingPrice)) {
          if (isLocalShipping) {
            price.add( new PartoshiAmount(priceInfo.ItemPrice.ShippingPrice.domestic, true) );
          } else {
            price.add( new PartoshiAmount(priceInfo.ItemPrice.ShippingPrice.international, true) );
          }
        }
      }
    }

    // Favourite?
    if (Array.isArray(from.FavoriteItems)) {

      for (let ii = 0; ii < from.FavoriteItems.length; ii++) {
        if (from.FavoriteItems[ii].profileId === profileId) {
          favId = from.FavoriteItems[ii].id;
          break;
        }
      }
    }

    // Process extra info
    isOwnListing = isBasicObjectType(from.ListingItemTemplate) && (+from.ListingItemTemplate.id > 0);
    // commentCount = Array.isArray(from.MessagingInformation) ? from.MessagingInformation.length : 0;
    commentCount = 0;

    const expirationTime = getValueOrDefault(from.expiredAt, 'number', 0);
    const itemIsFlagged = isBasicObjectType(from.FlaggedItem) && +from.FlaggedItem.id > 0;


    const newItem: ListingOverviewItem = {
      id: listingId,
      title: title,
      summary: summary,
      hash: getValueOrDefault(from.hash, 'string', ''),
      seller: listingSeller,
      expiry: expirationTime,
      image: imageSelected,
      price: {
        whole: price.particlStringInteger(),
        sep: price.particlStringSep(),
        decimal: price.particlStringFraction()
      },
      extras: {
        commentCount: commentCount,
        favouriteId: favId,
        isFlagged: itemIsFlagged,
        isOwn: isOwnListing,
        canAddToCart: !isOwnListing && (expirationTime > Date.now())
      }
    };

    return newItem;
  }

}
