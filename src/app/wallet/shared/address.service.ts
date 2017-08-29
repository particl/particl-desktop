import { Injectable } from '@angular/core';

import { Address, deserialize, TEST_ADDRESSES_JSON } from './address.model';
import { RPCService } from '../../core/rpc/rpc.service';

@Injectable()
export class AddressService {
  /*
    Settings
  */

  addressType: string = 'send'; // "receive","send", "total"

  /*
    How many addresses do we display per page and keep in memory at all times. When loading more
    addresses they are fetched JIT and added to addresses.
  */
  MAX_ADDRESSES_PER_PAGE: number = 5;



  /*
    Stores address objects.
  */
  addresses: Address[] = [];

  /* Pagination stuff */
  addressCount: number = 0;
  currentPage: number = 0;
  totalPageCount: number = 0;



  constructor(private rpc: RPCService) { }

  postConstructor(MAX_ADDRESSES_PER_PAGE: number) {
    this.MAX_ADDRESSES_PER_PAGE = MAX_ADDRESSES_PER_PAGE;
    this.rpc_update();
  }



/*
  UTIL
*/

  changePage(page: number) {
    if (page <= 0) {
      return;
    }
    page--;
    this.currentPage = page;
    this.rpc_update();
  }

  deleteAddresses() {
    this.addresses = [];
  }

/*
    RPC
*/

/*
  Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array.

*/
  rpc_update() {
    this.rpc.call('filteraddresses', [-1])
      // TODO: real address count + respons model
      .subscribe((response: any) => {
        this.addressCount = (
          this.addressType === 'receive' ?
          response.num_receive :
          (this.addressType === 'send' ?
          this.addressCount = response.num_send :
          this.addressCount = response.total));

        this.rpc.register(this, 'filteraddresses', this.rpc_getParams(), this.rpc_loadAddresses, 'address');
        // TODO: remove specialPoll
        this.rpc.specialPoll();
      });
  }

  rpc_getParams() {
    let page = 0;

    if (this.currentPage !== 0) {
      page = this.currentPage - 1;
    }

    const offset: number = (page * this.MAX_ADDRESSES_PER_PAGE);
    const count: number = this.MAX_ADDRESSES_PER_PAGE;
//    console.log("offset" + offset + " count" + count);
    if (this.addressType === 'receive') {
      return [offset, count, '0', '', '1'];
    } else if (this.addressType === 'send') {
      return [offset, count, '0', '', '2'];
    }

    return [offset, count];
  }

  rpc_loadAddresses(response: Object): void {
    this.deleteAddresses();
    for (const k in response) {
      if (response[k] !== undefined) { // lint
        this.addAddress(response[k]);
      }
    }
  }


  // Adds an address to array from JSON object.
  addAddress(json: Object): void {
    const instance = deserialize(json, Address);

    if (typeof instance.address === 'undefined') {
      return;
    }
    this.addresses.splice(0, 0, instance);
  }
}
