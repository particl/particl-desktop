import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, iif, defer } from 'rxjs';
import { retryWhen, concatMap, map, catchError } from 'rxjs/operators';
import { partition } from 'lodash';

import { ParticlRpcService } from 'app/networks/networks.module';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import {
  AddressType,
  AddressFilterSortDirection,
  AddressFilterOwnership,
} from './address.models';
import { RPCResponses } from 'app/networks/particl/particl.models';


type RecentAddressByType = {
  [key in AddressType]: RPCResponses.FilterAddress
};


@Injectable()
export class AddressService {

  constructor(
    private _rpc: ParticlRpcService
  ) { }


  deleteAddressFromAddressBook(address: string): Observable<boolean> {
    return this._rpc.call('manageaddressbook', ['del', address]).pipe(
      catchError(() => of(false)),
      map((resp) => resp ? true : false)
    );
  }

  saveAddressToAddressBook(address: string, label: string): Observable<RPCResponses.ManageAddressBook.NewSend> {
    return this._rpc.call<RPCResponses.ManageAddressBook.NewSend>('manageaddressbook', ['newsend', address, label]);
  }


  validateAddress(address: string): Observable<RPCResponses.ValidateAddress> {
    return this._rpc.call<RPCResponses.ValidateAddress>('validateaddress', [address]);
  }


  getAddressInfo(address: string): Observable<RPCResponses.GetAddressInfo> {
    return this._rpc.call<RPCResponses.GetAddressInfo>('getaddressinfo', [address]);
  }


  getDefaultStealthAddress(): Observable<string> {
    return this._rpc.call<RPCResponses.ListStealthAddresses>('liststealthaddresses', null).pipe(
      concatMap((list) => iif(
        () => list[0] &&
          list[0]['Stealth Addresses'] &&
          list[0]['Stealth Addresses'][0] &&
          (typeof list[0]['Stealth Addresses'][0]['Address'] === 'string'),

        defer(() => this.getAddressInfo(list[0]['Stealth Addresses'][0]['Address']).pipe(
          concatMap(addressDetails => iif(
            () =>  addressDetails && (typeof addressDetails.ismine === 'boolean') && addressDetails.ismine,
            defer(() => of(addressDetails.address)),
            defer(() => this.generateStealthAddress())
          ))
        )),
        defer(() => this.generateStealthAddress())
      ))
    );
  }


  updateAddressLabel(address: string, label: string): Observable<any> {
    return this._rpc.call<RPCResponses.SetLabel>('setlabel', [address, label]).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  signAddressMessage(address: string, message: string): Observable<string> {
    return this._rpc.call<RPCResponses.SignMessage>('signmessage', [address, message]);
  }


  verifySignedAddressMessage(address: string, signature: string, message: string): Observable<boolean> {
    return this._rpc.call<RPCResponses.VerifyMessage>('verifymessage', [address, signature, message]).pipe(
      map((response) => response ? true : false)
    );
  }


  queryAddressAmount(address: string, confirmations: number = 0): Observable<number> {
    return this._rpc.call<RPCResponses.GetReceivedByAddress>('getreceivedbyaddress', [address, confirmations]);
  }


  generatePublicAddress(label: string = ''): Observable<string> {
    return this._rpc.call<RPCResponses.GetNewAddress>('getnewaddress', [label]).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  generateStealthAddress(label: string = ''): Observable<string> {
    return this._rpc.call<RPCResponses.GetNewStealthAddress>('getnewstealthaddress', [label]).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  generateAddress(addressType: AddressType, label: string = ''): Observable<string> {
    switch (addressType) {
      case 'public': return this.generatePublicAddress(label); break;
      case 'private': return this.generateStealthAddress(label); break;
    }
  }


  fetchFilteredAddresses(
    offset: number = 0,
    count: number = 99999,
    sortDir: AddressFilterSortDirection = AddressFilterSortDirection.ASC,
    labelFilter: string = '',
    ownFilter: AddressFilterOwnership = AddressFilterOwnership.OWNED
  ): Observable<RPCResponses.FilterAddresses.List> {
    return this._rpc.call<RPCResponses.FilterAddresses.List>(
      'filteraddresses', [offset, count, `${sortDir}`, labelFilter, `${ownFilter}`]
    ).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  fetchOwnAddressHistory(type: AddressType | 'all' = 'all'): Observable<RPCResponses.FilterAddresses.List> {
    return this.fetchFilteredAddresses(0, 99999, AddressFilterSortDirection.ASC, '', AddressFilterOwnership.OWNED).pipe(
      map((response) => this.processAddressHistoryItems(response, type))
    );
  }


  fetchUnownedAddressHistory(type: AddressType | 'all' = 'all'): Observable<RPCResponses.FilterAddresses.List> {
    return this.fetchFilteredAddresses(0, 99999, AddressFilterSortDirection.ASC, '', AddressFilterOwnership.NOT_OWNED).pipe(
      map((response) => this.processAddressHistoryItems(response, type))
    );
  }


  fetchSavedContacts(): Observable<{address: string, label: string, type: AddressType}[]> {
    return this._rpc.call<RPCResponses.FilterAddresses.Count>('filteraddresses', [-1]).pipe(
      catchError(() => of({} as RPCResponses.FilterAddresses.Count)),
      concatMap((addrCounts) =>
        this.fetchFilteredAddresses(0, addrCounts.num_send || 1, AddressFilterSortDirection.ASC, '', AddressFilterOwnership.NOT_OWNED)
      ),
      map((addresses) => {
        return addresses.map(addr => {
          const address = typeof addr.address === 'string' ? addr.address : '';
          return { address, label: addr.label, type: (<AddressType>(address.length > 35 ? 'private' : 'public')) };
        });
      })
    );
  }


  fetchNewestAddressForAll(): Observable<RecentAddressByType> {
    return this._rpc.call<RPCResponses.FilterAddresses.Count>('filteraddresses', [-1]).pipe(
      concatMap((addrCounts) => {
        if (+addrCounts.num_receive > 0) {
          return this.fetchFilteredAddresses(0, +addrCounts.num_receive);
        }

        return of([] as RPCResponses.FilterAddresses.List);
      }),

      map((addresses) => {
        const compare = (a: RPCResponses.FilterAddress, b: RPCResponses.FilterAddress) => b.id - a.id;

        const partitioned: RPCResponses.FilterAddresses.List[] = partition(addresses, (address) => address.address.length < 35);
        const pub = (partitioned[0] || []).map((addr) => {
          addr.id = this.getAddressId(addr);
          return addr;
        }).sort(
          compare
        );


        const priv = (partitioned[1] || []).filter((addr: RPCResponses.FilterAddress) => {
          if (typeof addr.path === 'string' && addr.path.length > 0) {
            // not all stealth addresses are derived from HD wallet (importprivkey)
            // filter out accounts m/1 m/2 etc. stealth addresses are always m/0'/0'
            return !(/m\/[0-9]+/g.test(addr.path) && !/m\/[0-9]+'\/[0-9]+/g.test(addr.path));
          }
          return true;
        }).map((addr) => {
          addr.id = this.getAddressId(addr);
          return addr;
        }).sort(
          compare
        );

        return {
          public: pub.length > 0 ? pub[0] : {} as RPCResponses.FilterAddress,
          private: priv.length > 0 ? priv[0] : {} as RPCResponses.FilterAddress
        };
      }),

      concatMap((addresses) => this.validateAddressTypes(addresses))

    );
  }


  private validateAddressTypes(addressTypes: RecentAddressByType): Observable<RecentAddressByType> {
    const newQueries = {};

    const DEFAULT_FILTERED: RPCResponses.FilterAddress = {
      address: '',
      label: '',
      owned: 'true',
      root: '',
      path: '',
      id: 0
    };

    for (const addrType of Object.keys(addressTypes)) {
      if (addressTypes[addrType].address && (addressTypes[addrType].address.length <= 0)) {
        newQueries[addrType] = this.generateAddress(<AddressType>addrType);
      }
    }

    let resp: Observable<RecentAddressByType>;

    if (Object.keys(newQueries).length > 0) {
      // Generate a new address for every AddressType input if no address exists
      resp = forkJoin(newQueries).pipe(
        map( (result: RecentAddressByType) => {
          for (const key of Object.keys(result)) {
            addressTypes[key] = JSON.parse(JSON.stringify(DEFAULT_FILTERED));
            addressTypes[key].address = result[key];
          }
          return addressTypes;
        })
      );
    } else {
      resp = of(addressTypes);
    }

    return resp.pipe(
      concatMap((addresses) => {
        if (addresses.public && addresses.public.address.length > 0) {
          // Ensure that the public address has not been previously used
          return this.queryAddressAmount(addresses.public.address).pipe(
            catchError(() => of(0)),
            concatMap((amount: number) => {
              if (+amount > 0) {
                // Some funds found on the address, so generate a new one
                return this.generateAddress('public').pipe(
                  map((newAddress) => {
                    addresses.public.address = newAddress;
                    ++addresses.public.id;
                    return addresses;
                  })
                );
              }

              return of(addresses);
            })
          );
        }
        return of(addresses);
      })
    );
  }


  private getAddressId(address: RPCResponses.FilterAddress): number {
    if (typeof address.address !== 'string') {
      return -1;
    }
    if (address.address.length < 35) {
      // public address
      return (typeof address.path === 'string' && address.path.length > 0) ? +address.path.replace('m/0/', '') : -1;
    } else {
      // private address
      return (typeof address.path === 'string' && address.path.length > 0) ?
        +(address.path.replace('m/0\'/', '').replace('\'', '')) / 2 :
        -1;
    }
  }


  private processAddressHistoryItems(
    addresses: RPCResponses.FilterAddresses.List, type: AddressType | 'all'
  ): RPCResponses.FilterAddresses.List {
    const compare = (a: RPCResponses.FilterAddress, b: RPCResponses.FilterAddress) => b.id - a.id;

    const res: RPCResponses.FilterAddresses.List = [];

    addresses.forEach((address => {
      address.id = this.getAddressId(address);

      const pushAddress = (type === 'all') ||
        ((type === 'public') && (address.address.length < 35)) ||
        ( (type === 'private') &&
          (address.address.length >= 35) &&
          !(/m\/[0-9]+/g.test(address.path) && !/m\/[0-9]+'\/[0-9]+/g.test(address.path))
        );

      if (pushAddress) {
        res.push(address);
      }
    }));
    return res.sort(compare);
  }

}
