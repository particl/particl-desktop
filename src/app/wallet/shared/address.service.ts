import { Injectable } from '@angular/core';

import { Address, deserialize, TEST_ADDRESSES_JSON } from './address.model';

@Injectable()
export class AddressService {
  /*
    Stores address objects.
  */
  addresses: Address[] = [];

 /* Pagination stuff */
  addressCount: number = 0;
  currentPage: number = 0;
  totalPageCount: number = 0;

  /*
    How many addresses do we display per page and keep in memory at all times. When loading more
    addresses they are fetched JIT and added to txs.
  */
  MAX_ADDRESSES_PER_PAGE: number = 3;

  constructor() {
    this.initializeTestData();
   }

  // Pull test data and populate array of txs.
  initializeTestData(): void {
    this.loadTestAddress(0);
    this.addressCount = TEST_ADDRESSES_JSON.length;
  }

  loadTestAddress(index_start: number): void {
    for (let i = 0; i < this.MAX_ADDRESSES_PER_PAGE; i++) {
      const json = TEST_ADDRESSES_JSON[index_start + i];
      this.addAddress(<Address> json);
    }
  }
  
/*


 _  _ _______ _____ _
 | | | |__  __|_  _| |
 | | | | | |  | | | |
 | | | | | |  | | | |
 | |__| | | |  _| |_| |____
 \____/  |_| |_____|______|


*/

  changePage(page: number) {
  if (page <= 0) {
   return;
    }

  page--;

    this.currentPage = page;

    this.deleteAddresses();

    // page = 0 (first page) => rpc_loadTransactions(MAX_TXS_PER_PAGE, 0) => (0,10)
    // page = 1 (second page) => rpc_loadTransactions(MAX_TXS_PER_PAGE, 1 * MAX_TXS_PER_PAGE) (10, 20)
    this.rpc_loadAddresses(page * this.MAX_ADDRESSES_PER_PAGE);
  }

  deleteAddresses() {
    this.addresses = [];
  }

/*


 _____ _____  _____
 | __ \| __ \ / ____|
 | |__) | |__) | |
 | _ /| ___/| |
 | | \ \| |  | |____
 |_| \_\_|   \_____|


*/

/*
  Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array.

*/

 rpc_loadAddresses(index_start: number): void {

   this.loadTestAddress(index_start);
   // loadTransactionsRPC should call listtransaction amount index_start.
   // return this.txs;
 }

 rpc_loadAddressCount(): void {
   // call getwalletinfo txcount
   this.addressCount = TEST_ADDRESSES_JSON.length - 1;
 }

 // Adds an address to array from JSON object.
  addAddress(json: Address): void {
    const instance = deserialize(json, Address);

    if (typeof instance.address === 'undefined') {
      return;
    }

    this.addresses.splice(0, 0, instance);
  }

 deleteAddress(address: string) {
  console.log('delete ' + address);
 }

}
