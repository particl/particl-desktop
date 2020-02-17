import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { retryWhen, concatMap, map, catchError } from 'rxjs/operators';
import { partition } from 'lodash';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy, AddressHelper } from 'app/core/util/utils';
import {
  AddressType,
  FilteredAddressCount,
  FilteredAddress,
  AddressFilterSortDirection,
  AddressFilterOwnership,
  AddressInfo,
  AddressAdded
} from './address.models';


type RecentAddressByType = {
  [key in AddressType]: FilteredAddress
};


@Injectable()
export class AddressService {

  constructor(
    private _rpc: MainRpcService
  ) { }


  deleteAddressFromAddressBook(address: string): Observable<boolean> {
    return this._rpc.call('manageaddressbook', ['del', address]).pipe(
      catchError(() => of(false)),
      map((resp) => resp ? true : false)
    );
  }

  saveAddressToAddressBook(address: string, label: string): Observable<AddressAdded> {
    return this._rpc.call('manageaddressbook', ['newsend', address, label]);
  }


  getAddressInfo(address: string): Observable<AddressInfo> {
    return this._rpc.call('getaddressinfo', [address]);
  }


  updateAddressLabel(address: string, label: string) {
    return this._rpc.call('setlabel', [address, label]).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  queryAddressAmount(address: string, confirmations: number = 0): Observable<number> {
    return this._rpc.call('getreceivedbyaddress', [address, confirmations]);
  }


  generatePublicAddress(label: string = ''): Observable<string> {
    return this._rpc.call('getnewaddress', [label]).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  generateStealthAddress(label: string = ''): Observable<string> {
    return this._rpc.call('getnewstealthaddress', [label]).pipe(
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
  ): Observable<FilteredAddress[]> {
    return this._rpc.call('filteraddresses', [offset, count, `${sortDir}`, labelFilter, `${ownFilter}`]).pipe(
      retryWhen (genericPollingRetryStrategy())
    );
  }


  fetchOwnAddressHistory(type: AddressType | 'all' = 'all'): Observable<FilteredAddress[]> {
    return this.fetchFilteredAddresses(0, 99999, AddressFilterSortDirection.ASC, '', AddressFilterOwnership.OWNED).pipe(
      map((response) => this.processAddressHistoryItems(response, type))
    );
  }


  fetchUnownedAddressHistory(type: AddressType | 'all' = 'all'): Observable<FilteredAddress[]> {
    return this.fetchFilteredAddresses(0, 99999, AddressFilterSortDirection.ASC, '', AddressFilterOwnership.NOT_OWNED).pipe(
      map((response) => this.processAddressHistoryItems(response, type))
    );
  }


  fetchNewestAddressForAll(): Observable<RecentAddressByType> {
    return this._rpc.call('filteraddresses', [-1]).pipe(
      concatMap((addrCounts: FilteredAddressCount) => {
        if (+addrCounts.num_receive > 0) {
          return this.fetchFilteredAddresses(0, +addrCounts.num_receive)
        }

        return of([] as FilteredAddress[]);
      }),

      map((addresses) => {
        const compare = (a: FilteredAddress, b: FilteredAddress) => b.id - a.id;

        const partitioned: FilteredAddress[][] = partition(addresses, (address) => address.address.length < 35);
        const pub = (partitioned[0] || []).map((addr) => {
          addr.id = this.getAddressId(addr);
          return addr;
        }).sort(
          compare
        );


        const priv = (partitioned[1] || []).filter((addr: FilteredAddress) => {
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
          public: pub.length > 0 ? pub[0] : {} as FilteredAddress,
          private: priv.length > 0 ? priv[0] : {} as FilteredAddress
        };
      }),

      concatMap((addresses) => this.validateAddressTypes(addresses))

    );
  }


  private validateAddressTypes(addressTypes: RecentAddressByType): Observable<RecentAddressByType> {
    const newQueries = {};

    const DEFAULT_FILTERED: FilteredAddress = {
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
      resp = of(addressTypes)
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
                )
              }

              return of(addresses);
            })
          );
        }
        return of(addresses);
      })
    );
  }


  private getAddressId(address: FilteredAddress): number {
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


  private processAddressHistoryItems(addresses: FilteredAddress[], type: AddressType | 'all'): FilteredAddress[] {
    const compare = (a: FilteredAddress, b: FilteredAddress) => b.id - a.id;

    const res: FilteredAddress[] = [];

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
