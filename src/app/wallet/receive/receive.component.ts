import { Component, OnInit, HostListener } from '@angular/core';
import { RPCService } from '../../core/rpc/rpc.service';

import { Log } from 'ng2-logger';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {


  /*
    UI State
  */

  private type: string = 'public';
  public query: string = '';

  defaultAddress: Object = {
      id: 0,
      label: 'Empty label',
      address: 'Empty address',
      balance: 0,
      readable: ['Empty']
    }

  selected: any = {
      id: 0,
      label: 'Empty label',
      address: 'Empty address',
      balance: 0,
      readable: ['empty']
  };

  /*
    UI Pagination
  */
  addresses: any = {
    private: [this.defaultAddress],
    public: [this.defaultAddress],
    query: [this.defaultAddress]

  }

  MAX_ADDRESSES_PER_PAGE: number = 6;
  page: number;

  /*
    initialized boolean: when true => checkFreshAddress is already looping!
  */
  initialized: boolean = false;

  /*
    General
  */

  log: any = Log.create('receive.component');

  constructor(private rpc: RPCService) { }

  ngOnInit() {

    // start rpc
    this.rpc_update();

  }

/**
 * Returns the addresses to display in the UI with regards to both pagination and search/query.
 * Does _NOT_ return the fresh address!
 * @returns      Object[]
 */
  getSinglePage(): Array<Object> {
    if (this.inSearchMode()) { // in search mode
      this.addresses['query'] = this.addresses[this.type].filter(el => {
        return (
          el.label.toLowerCase().indexOf(this.query.toLowerCase()) !== -1
          || el.address.toLowerCase().indexOf(this.query.toLowerCase()) !== -1
        );
      });

      return this.addresses['query'].slice(((this.page - 1) * this.MAX_ADDRESSES_PER_PAGE), this.page * this.MAX_ADDRESSES_PER_PAGE);

    } else { // not in seach mode
      return this.addresses[this.type].slice(1 + ((this.page - 1) * this.MAX_ADDRESSES_PER_PAGE), this.page * this.MAX_ADDRESSES_PER_PAGE);
    }
  }

/**
 * Returns the fresh addresses to display in the UI.
 * @returns      Object[]
 */
  getFreshAddress(): Object {
    if (this.type === 'public') {
      return this.addresses.public[0];
    } else if (this.type === 'private') {
      return this.addresses.private[0];
    }
  }

/**
 * Returns the total counts of addresses to display in the UI with regards to both the type of address (private/public) and search.
 * Excludes the count for the fresh address! (- 1 except for search!)
 * @returns      number
 */
  getTotalCountForPagination(): number {
    if (this.inSearchMode()) {
      return this.addresses.query.length;
    }
    if (this.type === 'public') {
      return this.addresses.public.length - 1;
    } else if (this.type === 'private') {
      return this.addresses.private.length - 1;
    }
  }

/**
 * Called to change the page.
 * @returns      void
 */
  pageChanged(event: any) {
    if (event.page !== undefined) {
      this.log.d(`pageChanged, changing receive page to: ${event.page}`);
    }
  }

  /*
    UI Helper functions
  */

// ------------------

  /**
  * Returns whether we're in search mode or not!
  * The current table is showing limited results due to search.
  * Mainly for hiding the "Fresh address" & ease of use in other functions.
  */
  inSearchMode(): boolean {
    return (this.query !== undefined && this.query !== '');
  }

  /*
  * OnEscape => exit search results
  */
  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    // clear search bar on esc
    if (event.code.toLowerCase() === 'escape') {
      this.query = '';
    }
  }

// ------------------
  /**
  * sets the address type, also checks if valid. Also changes the selected address.
  */
  setAddressType(type: string) {
    if (type === 'public') {
      this.type = 'public';
    } else if (type === 'private') {
      this.type = 'private';
    }
    this.selectAddress(this.addresses[type][0]);
  }

  getAddressType() {
    return this.type;
  }

// ------------------

  /*
  *   Selected address stuff + QRcode
  */
  selectAddress(address: Object) {
    this.selected = address;
  }

  getQrSize() {
    const qr: any = document.getElementsByClassName('card qr')[0];
    return qr.offsetWidth - 40;
  }

// ------------------


  /*
    RPC LOGIC
  */

  rpc_update() {
    this.rpc.call(this, 'filteraddresses', [-1], this.rpc_loadAddressCount_success);
  }

  rpc_loadAddressCount_success(json: Object) {
    const count = json['num_receive'];
    this.rpc.call(this, 'filteraddresses', [0, count, '0', '', '1'], this.rpc_loadAddresses_success);
  }

  rpc_loadAddresses_success(json: Object) {
    const pub = [];
    const priv = [];
    for (const k in json) {

      // TODO: detect address better
      if (json[k].address.indexOf('p') === 0) {
        pub.push(json[k]);
      } else if (json[k].address.indexOf('T') === 0) {
        priv.push(json[k]);
      }
    }

    // I need to get the count of the addresses seperate in public/private first,
    // because this.addresses[type] can never be empty,
    // we need to delete our default address before doing addAddress..
    if (pub.length > 0) {
      this.addresses.public = [];
    }

    if (priv.length > 0) {
      this.addresses.private = [];
    }

    for (const k in pub) {
      if (true) { // make lint happy
        this.addAddress(pub[k], 'public');
      }
    }

    for (const k in priv) {
      if (true) { // make lint happy
        this.addAddress(priv[k], 'private');
      }
    }


    if (json[0] !== undefined) {
      this.sortArrays('public');
      this.sortArrays('private');

      if (this.type === 'public') {
        this.selectAddress(this.addresses.public[0]);
      } else if (this.type === 'private') {
        this.selectAddress(this.addresses.private[0]);
      }

    }

    if (!this.initialized) {
      this.initialized = true;
      this.checkIfFreshAddress();
    }

  }

  /**
  * Transforms the json to the right format and adds it to the right array (public / private)
  *
  */
  addAddress(json: Object, type: string) {
    const tempAddress = {
      id: 0,
      label: 'Empty label',
      address: 'Empty address',
      balance: 0,
      readable: ['Empty']
    }

    tempAddress.address = json['address'];
    if (json['label'] !== '' && json['label'] !== undefined) {
      tempAddress.label = json['label'];
    }

    tempAddress.readable = tempAddress.address.match(/.{1,4}/g);

    if (type === 'public') {

      // not all addresses are derived from HD wallet (importprivkey)
      if (json['path'] !== undefined) {
        tempAddress.id = json['path'].replace('m/0/', '');
      }
      this.addresses.public.unshift(tempAddress);

    } else if (type === 'private') {

      // not all stealth addresses are derived from HD wallet (importprivkey)
      if (json['path'] !== undefined) {
        tempAddress.id = +(json['path'].replace('m/0\'/', '').replace('\'', '')) / 2;
      }
      this.addresses.private.unshift(tempAddress);
    }
  }

  /**
  * Sorts the private/public address by id (= HD wallet path m/0/0 < m/0/1)
  *
  */
  sortArrays(type: string) {
    function compare(a: any, b: any) {
      return b.id - a.id;
    }

    this.addresses[type].sort(compare);
  }



// ------------------
  /*
    Checks if the newest address is still fresh (hasn't received funds).
    If it has received funds, generate a new address and update the table.
  */

  checkIfFreshAddress() {
    if (this.addresses.public[0].address !== 'Empty address') {
      this.rpc.call(this, 'getreceivedbyaddress', [this.addresses.public[0].address, 0], this.rpc_callbackFreshAddress_success);
    }
    setTimeout(() => { this.checkIfFreshAddress(); }, 30000);
  }

  rpc_callbackFreshAddress_success(json: Object) {
    if (json > 0) {
      this.log.i('rpc_callbackFreshAddress_success: Funds received, need fresh public address');
      this.rpc.call(this, 'getnewaddress', null, this.rpc_callbackGenerateFreshAddress_success);
    }
  }

  rpc_callbackGenerateFreshAddress_success(json: Object) {
    this.log.i('rpc_callbackGenerateFreshAddress_success: successfully retrieved fresh public address');

    // just call for a complete update, just adding the address isn't possible because
    this.rpc_update();
  }


// ------------------

  /*
    Generate a new address with label
  */
  newAddress() {
    const label = prompt('Label for new address');

    if (this.type === 'public') {
      this.rpc.call(this, 'getnewaddress', [label], this.rpc_generateNewAddress_success);
    } else if (this.type === 'private') {
      this.rpc.call(this, 'getnewstealthaddress', [label], this.rpc_generateNewAddress_success);
    }
  }

  rpc_generateNewAddress_success () {
    this.log.i('rpc_generateNewAddress_success: successfully retrieved new address');

    // just call for a complete update, just adding the address isn't possible because
    this.rpc_update();
  }
// ------------------



  selectInput() {
    const input: any = document.getElementsByClassName('header-input')[0];
    input.select();
  }

}
