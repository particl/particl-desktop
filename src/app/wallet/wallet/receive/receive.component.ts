import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService, RpcStateService } from '../../../core/core.module';
import { ModalsHelperService } from 'app/modals/modals.module';

import { AddAddressLabelComponent } from './modals/add-address-label/add-address-label.component';
import { SignatureAddressModalComponent } from '../shared/signature-address-modal/signature-address-modal.component';

import { SnackbarService } from '../../../core/snackbar/snackbar.service';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {

  @ViewChild('paginator') paginator: any;

  log: any = Log.create('receive.component');

  MAX_ADDRESSES_PER_PAGE: number = 10;
  PAGE_SIZE_OPTIONS: Array<number> = [10, 25, 50];

  /* UI State */
  public type: string = 'public';
  public query: string = '';
  public addressInput: boolean = true;
  public label: string = '';
  public address: string = '';
  testnet: boolean = false;
  initialized: boolean = false; /* true => checkUnusedAddress is already looping */
  selected: any;
  page: number = 1;

  /* UI Pagination */
  addresses: any = {
    private: [],
    public: [],
    query: []
  };

  constructor(private rpc: RpcService,
              public rpcState: RpcStateService,
              public dialog: MatDialog,
              private flashNotificationService: SnackbarService,
              private modals: ModalsHelperService) {
  }

  ngOnInit(): void {

    this.rpcState.observe('getblockchaininfo', 'chain').take(1)
     .subscribe(chain => this.testnet = chain === 'test');

    // start rpc
    this.rpc_update();
  }

  /**
    * Returns the addresses to display in the UI with regards to both pagination and search/query.
    * Does _NOT_ return the ununsed address!
    */
  getSinglePage(): Array<Object> {
    let type = this.type;

    if (this.inSearchMode()) {
      type = 'query';

      this.addresses.query = this.addresses[this.type].filter(el => {
        if (el) {
          return (
            el.label.toLowerCase().indexOf(this.query.toLowerCase()) !== -1 ||
            el.address.toLowerCase().indexOf(this.query.toLowerCase()) !== -1
          );
        } else {
          return;
        }
      });
    }

    // offset unused address by 1 if not in search mode
    // if in search mode -> offset = 0
    // else offset = 1 -> skip the unused address
    const offset: number = +(type !== 'query');

    return this.addresses[type].slice(
      offset + ((this.page - 1) * this.MAX_ADDRESSES_PER_PAGE),
      this.page * this.MAX_ADDRESSES_PER_PAGE
    );
  }

  // Reset pagination
  resetPagination(): void {
    if (this.paginator) {
      this.page = 1;
      this.paginator.resetPagination(0);
    }
  }

  /** Returns the unused addresses to display in the UI. */
  getUnusedAddress(): any {
    return this.addresses[this.type][0];
  }

  /**
    * Returns the total counts of addresses to display in the UI with regards to both the type of address (private/public) and search.
    * Excludes the count for the unused address! (- 1 except for search!)
    */
  getTotalCountForPagination(): number {
    if (this.inSearchMode()) {
      return this.addresses.query.length;
    }
    return this.addresses[this.type].length - 1;
  }

  /** Called to change the page. */
  pageChanged(event: any): void {
    if (event.pageIndex !== undefined) {
      this.MAX_ADDRESSES_PER_PAGE = event.pageSize;
      this.page = event.pageIndex + 1;
      this.log.d(event.pageIndex);
    }
  }

  /* ---- UI Helper functions ---------------------------------------------- */

  /**
    * Returns whether we're in search mode or not!
    * The current table is showing limited results due to search.
    * Mainly for hiding the "Unused address" & ease of use in other functions.
    */
  inSearchMode(): boolean {
    return !!this.query;
  }

  /** OnEscape => exit search results */
  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    // clear search bar on esc
    if (event.code.toLowerCase() === 'escape') {
      this.query = '';
    }
  }

  /**
    * Sets the address type, also checks if valid. Also changes the selected address.
    * @param type Address type to set
    */
  setAddressType(type: string): void {
    if (['public', 'private'].includes(type)) {
      this.type = type;
    }
    /* @TODO: can be removed */
    if (this.addresses[type].length === 0) {
      this.generateAddress()
    } else {
      this.selectAddress(this.addresses[type][0]);
    }
  }

  changeTab(tab: number): void {
    this.page = 1;
    this.exitLabelEditingMode();
    if (tab) {
      this.setAddressType('private');
    } else {
      this.setAddressType('public');
    }
  }

  getAddressType(): string {
    return this.type;
  }

  /**
    * Selected address stuff
    * @param address The address to select
    */
  selectAddress(address: string): void {
    this.selected = address;
  }
  /**
   * Opens a dialog when creating a new address.
   */
  openNewAddress(address?: string): void {
    const dialogRef = this.dialog.open(AddAddressLabelComponent);
    dialogRef.componentInstance.type = this.type;
    dialogRef.componentInstance.address = address ? address : '';

    // update receive page after adding address
    dialogRef.componentInstance.onAddressAdd.subscribe(result => this.rpc_update());
  }

  selectInput(): void {
    (<HTMLInputElement>document.getElementsByClassName('header-input')[0]).select();
  }

  copyToClipBoard(): void {
    this.flashNotificationService.open('Address copied to clipboard');
  }

  openSignatureModal(address: string): void {
    const dialogRef = this.dialog.open(SignatureAddressModalComponent);
    dialogRef.componentInstance.formData.address = address;
  }

  /* ---- RPC LOGIC -------------------------------------------------------- */

  /** Used to get the addresses. */
  rpc_update(): void {
    this.rpc.call('filteraddresses', [-1])
      .subscribe(
        response => this.rpc_loadAddressCount_success(response),
        error => this.log.er('error', error));
  }

  /**
    * Used to get the addresses.
    * TODO: Create interface
    */
  rpc_loadAddressCount_success(response: any): void {
    const count = response.num_receive;
    /*
    if (count ===) {
      console.log('openNewAddress()')
      this.updateLabel();
      return;
    }
    */
    this.rpc.call('filteraddresses', [0, count, '0', '', '1'])
      .subscribe(
        (resp: Array<any>) => this.rpc_loadAddresses_success(resp),
        error => this.log.er('error', error));
  }

  /**
    * Used to get the addresses.
    * @TODO: Create interface Array<AddressInterface?>
    */
  rpc_loadAddresses_success(response: Array<any>): void {
    const pub = [],
          priv = [];

    response.forEach((row) => {
      if (row.address.length < 35) {
        pub.push(row);
      } else {
        priv.push(row);
      }
    });

    if (pub.length > 0) {
      this.addresses.public = [];
    }

    if (priv.length > 0) {
      this.addresses.private = [];
    }

    pub .forEach((val) => this.addAddress(val, 'public'));
    priv.forEach((val) => this.addAddress(val, 'private'));

    if (!!response[0]) {
      this.sortArrays();

      this.selectAddress(this.addresses[this.type][0]);
    }

    if (!this.initialized) {
      this.initialized = true;
      this.checkIfUnusedAddress();
    }

  }

  /**
    * Transforms the json to the right format and adds it to the right array (public / private)
    * TODO: Create interface for response
    */
  addAddress(response: any, type: string): void {
    const tempAddress = {
      id: 0,
      label: '(No label)',
      address: 'Empty address',
      balance: 0,
      readable: ['Empty']
    };

    tempAddress.address = response.address;
    if (!!response.label) {
      tempAddress.label = response.label;
    }

    tempAddress.readable = tempAddress.address.match(/.{1,4}/g);

    if (type === 'public') {

      // not all addresses are derived from HD wallet (importprivkey)
      if (!!response.path) {
        tempAddress.id = response.path.replace('m/0/', '');
      }
      this.addresses.public.unshift(tempAddress);

    } else if (type === 'private') {

      // not all stealth addresses are derived from HD wallet (importprivkey)
      if (response.path !== undefined) {
        tempAddress.id = +(response.path.replace('m/0\'/', '').replace('\'', '')) / 2;

        // filter out accounts m/1 m/2 etc. stealth addresses are always m/0'/0'
        if (/m\/[0-9]+/g.test(response.path) && !/m\/[0-9]+'\/[0-9]+/g.test(response.path)) {
          return;
        }
      }
      this.addresses.private.unshift(tempAddress);
    }
  }

  /** Sorts the private/public address by id (= HD wallet path m/0/0 < m/0/1) */
  sortArrays(): void {
    const compare = (a, b) => b.id - a.id;

    this.addresses.public.sort(compare);
    this.addresses.private.sort(compare);
  }


  /** Checks if the newest address is still unused (hasn't received funds).
    * If it has received funds, generate a new address and update the table.
    * TODO: Remove timeout if not currently on ngOnDestroy
    */
  checkIfUnusedAddress(): void {
    if (this.addresses && this.addresses.public[0] && this.addresses.public[0].address) {
      this.rpc.call('getreceivedbyaddress', [this.addresses.public[0].address, 0])
        .subscribe(
          response => this.rpc_callbackUnusedAddress_success(response),
          error => this.log.er('error', error));
    }
    setTimeout(this.checkIfUnusedAddress, 30000);
  }

  rpc_callbackUnusedAddress_success(json: Object): void {
    if (json > 0) {
      this.log.er('rpc_callbackUnusedAddress_success: Funds received, need unused public address');

      // this.rpc.oldCall(this, 'getnewaddress', null, () => {
      //   this.log.er('rpc_callbackUnusedAddress_success: successfully retrieved new address');

      //   // just call for a complete update, just adding the address isn't possible because
      //   this.rpc_update();
      // });

      this.rpc.call('getnewaddress', null)
      .subscribe(response => {
        this.log.er('rpc_callbackUnusedAddress_success: successfully retrieved new address');

        // just call for a complete update, just adding the address isn't possible because
        this.rpc_update();
      },
      error => this.log.er('error'));
    }
  }

  updateLabel(address: string) {
    this.address = address
    this.modals.unlock({timeout: 3}, (status) => this.editLabel());
  }

  generateAddress(): void {
    this.modals.unlock({timeout: 3}, (status) => this.newAddress());
  }

  newAddress() {
    const call = (this.type === 'public' ? 'getnewaddress' : (this.type === 'private' ? 'getnewstealthaddress' : ''));
    const callParams = ['(No label)'];
    const msg = `New ${this.type} address generated`;
    this.rpcCallAndNotify(call, callParams, msg);
  }

  editLabel(): void {
    const call = 'manageaddressbook';
    const callParams = ['newsend', this.address, this.label];
    const msg = `Label for ${this.address} updated`;
    this.rpcCallAndNotify(call, callParams, msg);
  }

  rpcCallAndNotify(call: string, callParams: any, msg: string): void {
    if (call) {
      this.rpc.call(call, callParams)
        .subscribe(response => {
          this.log.d(call, `addNewLabel: successfully executed ${call} ${callParams}`);
          this.flashNotificationService.open(msg)
          this.exitLabelEditingMode();
          this.rpc_update();
        });
    }
  }

  exitLabelEditingMode(): void {
    this.addressInput = true;
  }
}
