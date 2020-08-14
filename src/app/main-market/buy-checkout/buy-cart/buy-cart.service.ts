import { Injectable } from '@angular/core';
import { Observable, of, iif, defer, concat, throwError } from 'rxjs';
import { map, catchError, concatMap, mapTo, reduce } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { RegionListService } from 'app/main-market/services/region-list/region-list.service';
import { DataService } from '../../services/data/data.service';

import { formatImagePath, getValueOrDefault, isBasicObjectType } from '../../shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';
import { RespMarketListMarketItem, RespCartItemListItem, RespAddressListItem, ADDRESS_TYPES, RespAddressAdd } from '../../shared/market.models';
import { ShippingAddress } from '../../shared/shipping-profile-address-form/shipping-profile-address.models';
import { CartItem } from './buy-cart.models';
import { ListingItemDetail } from '../../shared/listing-detail-modal/listing-detail.models';


interface CartItemBidDetails {
  cartItemId: number;
  listingItemId: number;
}


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
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    const cart = this._store.selectSnapshot(MarketState.availableCarts)[0];

    if (!(cart && (+cart.id > 0))) {
      return throwError('InvalidCart');
    }

    const markets$ = this._rpc.call('market', ['list', profileId]).pipe(
      map((markets: RespMarketListMarketItem[]) => {
        return markets.map(m => ({key: m.publishAddress, name: m.name}));
      }),
      catchError(() => of([]))
    );

    return this._rpc.call('cartitem', ['list', +cart.id]).pipe(
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
        if (!Array.isArray(addresses)) {
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


  removeAllCurrentCartItems(): Observable<boolean> {
    const cart = this._store.selectSnapshot(MarketState.availableCarts)[0];

    if (!cart || !(+cart.id > 0)) {
      return of(false);
    }
    return this._rpc.call('cart', ['clear', cart.id]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  saveAddressFields(
    title: string,
    firstName: string,
    lastName: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    countryCode: string,
    zipCode: string,
    addressId: number | null = null
  ): Observable<ShippingAddress> {
      let obs$: Observable<RespAddressAdd>;

      if (!(+addressId > 0)) {
        const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
        obs$ = this._rpc.call('address', ['add',
          profileId,
          title,
          firstName,
          lastName,
          addressLine1,
          addressLine2,
          city,
          state,
          countryCode,
          zipCode
        ]);
      } else {
        obs$ = this._rpc.call('address', ['update',
          addressId,
          title,
          firstName,
          lastName,
          addressLine1,
          addressLine2,
          city,
          state,
          countryCode,
          zipCode
        ]);
      }

      return obs$.pipe(
        catchError(() => of(null)),
        map(addr => this.buildShippingAddress(addr))
      );
  }


  /**
   * Places bids on items in the current shopping cart
   *
   * @param addressDetails details of the address to ship the items to. Note that values such as the id are ignored.
   *
   * @returns boolean indicating whether the shopping cart has been successfully cleared of all items successfully bid on (true)
   *  or the cart may not reflect the correct state of bids (eg: bid placed but an error prevented the cart from being cleared of that item)
   *
   * Note that an error may be thrown if a bid send message errors
   */
  checkoutCart(addressDetails: ShippingAddress): Observable<boolean> {
    const cartId = this._store.selectSnapshot(MarketState.availableCarts)[0].id;
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;

    if (!((+cartId > 0) && (+identityId > 0))) {
      return of(true);
    }

    // get list of items in the cart
    return this._rpc.call('cartitem', ['list', cartId]).pipe(
      map((cartItems: RespCartItemListItem[]) => cartItems.map(ci => {
        const mappedValue: CartItemBidDetails = {cartItemId: +ci.id, listingItemId: +ci.listingItemId};
        return mappedValue;
      })),
      catchError(() => of([] as CartItemBidDetails[])),
      map(items => {
        // map cart items to 'bid send' observables
        return items.map(ci =>
          this._rpc.call(
            'bid',
            ['send', ci.listingItemId, identityId, false,
              'shippingAddress.firstName',
              addressDetails.firstName,
              'shippingAddress.lastName',
              addressDetails.lastName,
              'shippingAddress.addressLine1',
              addressDetails.addressLine1,
              'shippingAddress.addressLine2',
              addressDetails.addressLine2,
              'shippingAddress.city',
              addressDetails.city,
              'shippingAddress.state',
              addressDetails.state,
              'shippingAddress.zipCode',
              addressDetails.zipCode,
              'shippingAddress.country',
              addressDetails.countryCode
            ]
          ).pipe(
            concatMap(() => this.removeCartItem(ci.cartItemId).pipe(
              catchError(() => of(false)),
            ))
          )
        );
      }),

      concatMap((bidObservables) => iif(
        () => bidObservables.length > 0,
        // run the bid send observables one at a time, accumulating results for eventually sending when the bids are all done,
        //    ie: 1 response value instead of multiple from each inner bid
        concat(...bidObservables).pipe(reduce((acc, newVal) => acc && newVal, true)),
        of(true)
      ))
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

      if (Array.isArray(from.ListingItem.ItemInformation.ShippingDestinations)) {
        from.ListingItem.ItemInformation.ShippingDestinations.forEach((shipping) => {
          if ((getValueOrDefault(shipping.country, 'string', '') !== '') && (shipping.shippingAvailability === 'SHIPS')) {
            newCartItem.shippingLocations.push(shipping.country);
          }
        });
      }

      if (
        (Array.isArray(from.ListingItem.ItemInformation.ItemImages)) &&
        (from.ListingItem.ItemInformation.ItemImages.length)
      ) {
        let featured = from.ListingItem.ItemInformation.ItemImages.find(img => img.featured);
        if (featured === undefined) {
          featured = from.ListingItem.ItemInformation.ItemImages[0];
        }

        const imgDatas = Array.isArray(featured.ItemImageDatas) ? featured.ItemImageDatas : [];
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
