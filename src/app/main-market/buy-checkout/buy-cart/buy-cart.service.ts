import { Injectable } from '@angular/core';
import { Observable, of, iif, defer } from 'rxjs';
import { map, catchError, concatMap, mapTo } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { RegionListService } from 'app/main-market/services/region-list/region-list.service';
import { DataService } from '../../services/data/data.service';

import { formatImagePath, getValueOrDefault, isBasicObjectType } from '../../shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';
import { RespMarketListMarketItem, RespCartItemListItem, RespAddressListItem, ADDRESS_TYPES } from '../../shared/market.models';
import { ShippingAddress } from '../../shared/shipping-profile-address-form/shipping-profile-address.models';
import { CartItem } from './buy-cart.models';
import { ListingItemDetail } from '../../shared/listing-detail-modal/listing-detail.models';


@Injectable()
export class BuyCartService {

  constructor(
    private _rpc: MarketRpcService,
    private _regionService: RegionListService,
    private _sharedDataService: DataService,
    private _store: Store,
  ) {}


  getDefaultShippingRegion(): Observable<string> {
    return of(this._store.selectSnapshot(MarketState.settings).userRegion);
  }


  getListingItemDetails(listingId: number): Observable<ListingItemDetail> {
    return this._sharedDataService.getListingDetailsForMarket(listingId, 0);
  }


  fetchCartItems(): Observable<CartItem[]> {
    const cartId = this._store.selectSnapshot(MarketState.availableCarts)[0].id;
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;

    if (!(+cartId > 0)) {
      return of([]);
    }

    const markets$ = this._rpc.call('market', ['list', profileId]).pipe(
      map((markets: RespMarketListMarketItem[]) => {
        return markets.map(m => ({key: m.publishAddress, name: m.name}));
      }),
      catchError(() => of([]))
    );

    return this._rpc.call('cartitem', ['list', cartId]).pipe(
      concatMap((cartItems: RespCartItemListItem[]) => iif(
        () => cartItems.length > 0,

        defer(() => markets$.pipe(
          map((marketValues) => {
            const settings = this._store.selectSnapshot(MarketState.settings);
            return cartItems.map(
              item => this.buildCartItem(item, settings.port, marketValues)
            ).filter(
              l => (l.listingId > 0) && (l.id > 0)
            );
          })
        )),

        of([])
      ))
    );
  }


  fetchSavedAddresses(): Observable<ShippingAddress[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('address', ['list', profileId, ADDRESS_TYPES.SHIPPING_OWN ]).pipe(
      map((addresses: RespAddressListItem[]) => {
        if (Object.prototype.toString.call(addresses) !== '[object Array]') {
          return [];
        }

        const addrList = addresses.reverse().map(addr => this.buildShippingAddress(addr));
        const codes: string[] = [];
        addrList.forEach(addr => {
          if (addr.countryCode && !addr.country) {
            codes.push(addr.countryCode);
          }
        });

        const countries = this._regionService.findCountriesByIsoCodes(codes);
        addrList.forEach(addr => {
          if (addr.countryCode && !addr.country) {
            const country = countries.find(c => c.iso === addr.countryCode);
            if (country) {
              addr.country = country.name;
            } else {
              addr.country = addr.countryCode;
            }
          }
        });

        return addrList;

      })
    );
  }


  removeCartItem(cartItemId: number): Observable<boolean> {
    return this._rpc.call('cartitem', ['remove', cartItemId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  private buildCartItem(from: RespCartItemListItem, marketPort: number, markets: { key: string, name: string; }[]): CartItem {

    const newCartItem: CartItem = {
      id: 0,
      listingId: 0,
      title: '',
      image: './assets/images/placeholder_4-3.jpg',
      category: '',
      marketName: '',
      expiryTime: 0,
      escrowPercent: 100,
      price: {
        base: new PartoshiAmount(0),
        shippingLocal: new PartoshiAmount(0),
        shippingIntl: new PartoshiAmount(0),
      },
      sourceLocation: '',
      shippingLocations: [],
    };

    if (!(isBasicObjectType(from) && isBasicObjectType(from.ListingItem) && (+from.ListingItem.id > 0))) {
      return newCartItem;
    }

    newCartItem.id = +from.id > 0 ? +from.id : 0;

    newCartItem.listingId = +from.ListingItem.id;
    const foundMarket = markets.find(m => m.key === from.ListingItem.market);
    if (foundMarket) {
      newCartItem.marketName = foundMarket.name;
    }

    if (isBasicObjectType(from.ListingItem.ItemInformation)) {
      newCartItem.title = getValueOrDefault(from.ListingItem.ItemInformation.title, 'string', newCartItem.title);
      newCartItem.expiryTime = getValueOrDefault(from.ListingItem.expiredAt, 'number', newCartItem.expiryTime);

      if (Object.prototype.toString.call(from.ListingItem.ItemInformation.ShippingDestinations) === '[object Array]') {
        from.ListingItem.ItemInformation.ShippingDestinations.forEach((shipping) => {
          if ((getValueOrDefault(shipping.country, 'string', '') !== '') && (shipping.shippingAvailability === 'SHIPS')) {
            newCartItem.shippingLocations.push(shipping.country);
          }
        });
      }

      if (
        (Object.prototype.toString.call(from.ListingItem.ItemInformation.ItemImages) === '[object Array]') &&
        (from.ListingItem.ItemInformation.ItemImages.length)
      ) {
        let featured = from.ListingItem.ItemInformation.ItemImages.find(img => img.featured);
        if (featured === undefined) {
          featured = from.ListingItem.ItemInformation.ItemImages[0];
        }

        const imgDatas = Object.prototype.toString.call(featured.ItemImageDatas) === '[object Array]' ? featured.ItemImageDatas : [];
        const selected = imgDatas.find(d => d.imageVersion && d.imageVersion === 'MEDIUM');
        if (selected) {
          newCartItem.image = formatImagePath(getValueOrDefault(selected.dataId, 'string', ''), marketPort) || newCartItem.image;
        }
      }

      if (isBasicObjectType(from.ListingItem.ItemInformation.ItemLocation)) {
        newCartItem.sourceLocation = getValueOrDefault(
          from.ListingItem.ItemInformation.ItemLocation.country, 'string', newCartItem.sourceLocation
        );
      }

      if (isBasicObjectType(from.ListingItem.ItemInformation.ItemCategory)) {
        newCartItem.category = getValueOrDefault(from.ListingItem.ItemInformation.ItemCategory.description, 'string', newCartItem.category);
      }
    }

    if (isBasicObjectType(from.ListingItem.PaymentInformation)) {
      if (
        isBasicObjectType(from.ListingItem.PaymentInformation.Escrow) &&
        isBasicObjectType(from.ListingItem.PaymentInformation.Escrow.Ratio)
      ) {
        newCartItem.escrowPercent = getValueOrDefault(
          from.ListingItem.PaymentInformation.Escrow.Ratio.buyer, 'number', newCartItem.escrowPercent
        );
      }

      if (isBasicObjectType(from.ListingItem.PaymentInformation.ItemPrice)) {
        newCartItem.price.base.add(new PartoshiAmount(+from.ListingItem.PaymentInformation.ItemPrice.basePrice, true));

        if (isBasicObjectType(from.ListingItem.PaymentInformation.ItemPrice.ShippingPrice)) {
          newCartItem.price.shippingLocal.add(
            new PartoshiAmount(+from.ListingItem.PaymentInformation.ItemPrice.ShippingPrice.domestic, true)
          );
          newCartItem.price.shippingIntl.add(
            new PartoshiAmount(+from.ListingItem.PaymentInformation.ItemPrice.ShippingPrice.international, true)
          );
        }
      }
    }

    return newCartItem;
  }


  private buildShippingAddress(obj: RespAddressListItem): ShippingAddress {
    const newAddress: ShippingAddress = {
      id: 0,
      title: '',
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      countryCode: ''
    };

    if (!isBasicObjectType(obj)) {
      return newAddress;
    }

    newAddress.id = getValueOrDefault(obj.id, 'number', newAddress.id);
    newAddress.title = getValueOrDefault(obj.title, 'string', newAddress.title);
    newAddress.firstName = getValueOrDefault(obj.firstName, 'string', newAddress.firstName);
    newAddress.lastName = getValueOrDefault(obj.lastName, 'string', newAddress.lastName);
    newAddress.addressLine1 = getValueOrDefault(obj.addressLine1, 'string', newAddress.addressLine1);
    newAddress.addressLine2 = getValueOrDefault(obj.addressLine2, 'string', newAddress.addressLine2);
    newAddress.city = getValueOrDefault(obj.city, 'string', newAddress.city);
    newAddress.state = getValueOrDefault(obj.state, 'string', newAddress.state);
    newAddress.zipCode = getValueOrDefault(obj.zipCode, 'string', newAddress.zipCode);
    const recCountry = getValueOrDefault(obj.country, 'string', newAddress.country);

    if (recCountry.length > 2) {
      newAddress.country = recCountry;
    } else {
      newAddress.countryCode = recCountry;
    }

    return newAddress;
  }

}
