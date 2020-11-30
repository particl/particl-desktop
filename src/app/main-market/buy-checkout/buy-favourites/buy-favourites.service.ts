import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mapTo, catchError, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { MarketUserActions } from 'app/main-market/store/market.actions';

import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../../shared/utils';
import { RespFavoriteItem, RespCartItemAdd } from '../../shared/market.models';
import { FavouritedListing } from './buy-favourites.models';
import { PartoshiAmount } from 'app/core/util/utils';


@Injectable()
export class FavouritesService {

  private readonly EXPIRY_DELAY: number = 1000 * 30;

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
  ) {}


  fetchFavourites(): Observable<FavouritedListing[]> {
    return this._rpc.call('favorite', ['list', this._store.selectSnapshot(MarketState.currentProfile).id]).pipe(
      map((resp: RespFavoriteItem[]) => {
        const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
        const userDefaultRegion = this._store.selectSnapshot(MarketState.settings).userRegion;
        const defaultImagePath = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
        return resp.map(item => this.createFavouriteItem(item, marketUrl, defaultImagePath, userDefaultRegion));
      })
    );
  }


  removeFavourite(favouriteId: number): Observable<boolean> {
    return this._rpc.call('favorite', ['remove', favouriteId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  addItemToCart(listingId: number, cartId: number): Observable<RespCartItemAdd> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('cartitem', ['add', cartId, listingId]).pipe(
      tap(() => this._store.dispatch(new MarketUserActions.CartItemAdded(identityId, cartId)))
    );
  }


  private createFavouriteItem(from: RespFavoriteItem, marketUrl: string, defaultImage: string, userRegion: string): FavouritedListing {

    let favId = 0,
        listingId = 0,
        title = '',
        summary = '',
        hash = '',
        image = defaultImage,
        expiry = 0,
        isOwn = false,
        marketKey = '';

    const price = new PartoshiAmount(0);

    if (isBasicObjectType(from)) {
      favId = getValueOrDefault(from.id, 'number', favId);

      const fromListing = from.ListingItem;

      if (isBasicObjectType(fromListing)) {
        let isLocalShipping = false;

        if (isBasicObjectType(fromListing.ItemInformation)) {
          listingId = getValueOrDefault(fromListing.id, 'number', listingId);
          title = getValueOrDefault(fromListing.ItemInformation.title, 'string', title);
          summary = getValueOrDefault(fromListing.ItemInformation.shortDescription, 'string', summary);
          hash = getValueOrDefault(fromListing.hash, 'string', hash);
          expiry = getValueOrDefault(fromListing.expiredAt, 'number', expiry);
          isOwn = +fromListing.listingItemTemplateId > 0;

          marketKey = getValueOrDefault(fromListing.market, 'string', marketKey);

          if (isBasicObjectType(fromListing.ItemInformation.ItemLocation)) {
            isLocalShipping = userRegion === getValueOrDefault(fromListing.ItemInformation.ItemLocation.country, 'string', '');
          }


          if (Array.isArray(fromListing.ItemInformation.Images) && (fromListing.ItemInformation.Images.length > 0)) {
            let featured = fromListing.ItemInformation.Images.find(img => img.featured);
            if (featured === undefined) {
              featured = fromListing.ItemInformation.Images[0];
            }
            image = parseImagePath(featured, 'MEDIUM', marketUrl) || parseImagePath(featured, 'ORIGINAL', marketUrl) || image;
          }
        }

        if (isBasicObjectType(fromListing.PaymentInformation)) {
          if (isBasicObjectType(fromListing.PaymentInformation.ItemPrice)) {
            price.add(new PartoshiAmount(fromListing.PaymentInformation.ItemPrice.basePrice, true));

            if (userRegion && isBasicObjectType(fromListing.PaymentInformation.ItemPrice.ShippingPrice)) {

              if (isLocalShipping) {
                price.add( new PartoshiAmount(fromListing.PaymentInformation.ItemPrice.ShippingPrice.domestic, true) );
              } else {
                price.add( new PartoshiAmount(fromListing.PaymentInformation.ItemPrice.ShippingPrice.international, true) );
              }
            }
          }
        }
      }
    }

    const newItem: FavouritedListing = {
      favouriteId: favId,
      listingId: listingId,
      marketKey: marketKey,
      title: title,
      summary: summary,
      hash: hash,
      image: image,
      expiry: expiry,
      price: {
        whole: price.particlStringInteger(),
        sep: price.particlStringSep(),
        decimal: price.particlStringFraction()
      },
      isOwn: isOwn,
      canAddToCart: !(isOwn || (expiry < (Date.now() + this.EXPIRY_DELAY)))
    };

    return newItem;
  }

}
