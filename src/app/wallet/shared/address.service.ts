import { Injectable } from '@angular/core';

import { Address, deserialize, TEST_ADDRESSES_JSON } from './address.model';
import { AppService } from '../../app.service';

@Injectable()
export class AddressService {
  /*
    Settings
  */

  typeOfAddresses: string = 'receive'; // "receive","send", "total"

  /*
    How many addresses do we display per page and keep in memory at all times. When loading more
    addresses they are fetched JIT and added to addresses.
  */
  MAX_ADDRESSES_PER_PAGE: number = 2;



  /*
    Stores address objects.
  */
  addresses: Address[] = [];

  /* Pagination stuff */
  addressCount: number = 0;
  currentPage: number = 0;
  totalPageCount: number = 0;



  constructor(private appService: AppService) {
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
    this.appService.rpc.call(this, 'filteraddresses', [-1], this.rpc_loadAddressCount);
  }

  // TODO: real address count
  rpc_loadAddressCount(JSON: Object): void {
    // test values
    let addressCount;
    if (this.typeOfAddresses === 'receive') {
      addressCount = JSON['num_receive'];
    } else if (this.typeOfAddresses === 'send') {
      addressCount = JSON['num_send'];
    } else {
      addressCount = JSON['total'];
    }
    this.addressCount = addressCount;
    this.appService.rpc.call(this, 'filteraddresses', this.rpc_getParams(), this.rpc_loadAddresses);
  }

  rpc_getParams() {
    let page = 0;

    if (this.currentPage !== 0) {
      page = this.currentPage - 1;
    }

    const offset: number = (page * this.MAX_ADDRESSES_PER_PAGE);
    const count: number = this.MAX_ADDRESSES_PER_PAGE;
//    console.log("offset" + offset + " count" + count);
    if (this.typeOfAddresses === 'receive') {
      return [offset, count, '0', '', '1'];
    } else if (this.typeOfAddresses === 'send') {
      return [offset, count, '0', '', '2'];
    }

    return [offset, count];
  }

  rpc_loadAddresses(JSON: Object): void {
    this.deleteAddresses();
    for (const k in JSON) {
      if (JSON[k] !== undefined) { // lint
        this.addAddress(JSON[k]);
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
