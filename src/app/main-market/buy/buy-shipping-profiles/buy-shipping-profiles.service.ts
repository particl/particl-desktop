import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, mapTo } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { RegionListService } from 'app/main-market/services/region-list/region-list.service';

import { getValueOrDefault, isBasicObjectType } from '../../shared/utils';
import { ADDRESS_TYPES, RespAddressListItem, RespAddressAdd } from '../../shared/market.models';
import { ShippingAddress } from '../../shared/shipping-profile-address-form/shipping-profile-address.models';


@Injectable()
export class BuyShippingProfilesService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _regionService: RegionListService
  ) {}


  fetchOwnAddresses(): Observable<ShippingAddress[]> {
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


  createOwnAddress(
    title: string,
    firstName: string,
    lastName: string,
    line1: string,
    line2: string,
    city: string,
    state: string,
    countryCode: string,
    postalCode: string
  ): Observable<ShippingAddress> {

    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('address', [
      'add',
      profileId, title, firstName, lastName, line1, line2, city, state, countryCode, postalCode, ADDRESS_TYPES.SHIPPING_OWN
    ]).pipe(
      map((resp: RespAddressAdd) => {
        const addr = this.buildShippingAddress(resp);
        if (addr.countryCode && !addr.country) {
          const country = this._regionService.findCountriesByIsoCodes([addr.countryCode]);
          if (country) {
            addr.country = country[0].name;
          } else {
            addr.country = addr.countryCode;
          }
        }
        return addr;
      })
    );
  }


  updateOwnAddress(
    addressId: number,
    title: string,
    firstName: string,
    lastName: string,
    line1: string,
    line2: string,
    city: string,
    state: string,
    countryCode: string,
    postalCode: string
  ): Observable<ShippingAddress> {
    return this._rpc.call(
      'address',
      ['update', addressId, title, firstName, lastName, line1, line2, city, state, countryCode, postalCode, ADDRESS_TYPES.SHIPPING_OWN]
    ).pipe(
      map((resp: RespAddressAdd) => {
        const addr = this.buildShippingAddress(resp);
        if (addr.countryCode && !addr.country) {
          const country = this._regionService.findCountriesByIsoCodes([addr.countryCode]);
          if (country) {
            addr.country = country[0].name;
          } else {
            addr.country = addr.countryCode;
          }
        }
        return addr;
      })
    );
  }


  deleteAddress(addressId: number): Observable<boolean> {
    return this._rpc.call('address', ['remove', addressId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
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
