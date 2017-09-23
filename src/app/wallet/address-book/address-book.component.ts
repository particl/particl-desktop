import { Component, OnInit, HostListener } from '@angular/core';

import { RPCService } from '../../core/rpc/rpc.service';

import { Log } from 'ng2-logger'

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {

  log: any = Log.create('address-book.component');

  query: string;

  // UI state
  label: string = '';
  address: string;
  openNewAddressModal: boolean = false;
  public errorAddress: boolean = false;
  public errorString: string = '';
  // Validation state
  public validAddress: boolean = undefined;
  public isMine: boolean = undefined;
  public isLocked: boolean = false;

  constructor(private _rpc: RPCService) { }

  ngOnInit() {
  }

  openNewAddress() {
    this.isLocked = false;
    this.openNewAddressModal = true;
  }

  closeNewAddress() {
    this.openNewAddressModal = false;
  }

  clearAndClose() {
    // reset UI state
    this.label = '';
    this.address = '';

    // reset validation
    this.validAddress = undefined;
    this.isMine = undefined;

    this.closeNewAddress();
  }

  /** Returns if the entered address is valid or not AND if it is not ours (isMine). */
  checkAddress(): boolean {
    return this.validAddress === true && !this.isMine;
  }

  /** Add address to addressbook */
  editLabel(address: string) {
    this.log.d(`editLabel, address: ${address}`);
    this.address = address;
    this.verifyAddress();
    this.openNewAddress();
  }
  /**
    * Adds the address to the addressbook if address is valid and
    * has a label (in the textbox) and is not one of our own addresses.
    */
  addAddressToBook() {
    if (this.label) {
      this._rpc.call('manageaddressbook', ['newsend', this.address, this.label])
        .subscribe(
          response => this.rpc_addAddressToBook_success(response),
          error => this.rpc_addAddressToBook_failed(error));
    }
  }

  /**
    * Address was added succesfully to the address book.
    * TODO: INTERFACE
    */
  rpc_addAddressToBook_success(response: any) {
    if (response && response.result === 'success') {
      this.address = undefined;
      this.label = '';
      this.closeNewAddress();
      // TODO: remove specialPoll! (updates the address table)
      this._rpc.specialPoll();
    } else {
      this.isLocked = true;
    }
    this.validAddress = undefined;
    this.isMine = undefined;
  }

  /**
    * Address was not added to the addressbook
    * e.g: wallet still locked
    */
  rpc_addAddressToBook_failed(response: Object) {
    this.log.er('rpc_addAddressToBook_failed', response);
    this.log.er(response);
    // TODO: remove specialPoll! (updates the address table)
    this._rpc.specialPoll();
  }

  /** Verify if address is valid through RPC call and sets state to validAddress.. */
  verifyAddress() {
    if (this.address === undefined || this.address === '') {
      this.validAddress = undefined;
      this.isMine = undefined;
      this.isLocked = false;
      return;
    }

    this._rpc.call('validateaddress', [this.address])
      .subscribe(
        response => this.rpc_verifyAddress_success(response),
        error => this.log.er('rpc_validateaddress_failed'));

    return;
  }

  /**
    * Callback of verifyAddress
    * - sets state.
    * TODO: Success INTERFACE
    */
  rpc_verifyAddress_success(response: any) {
    this.validAddress = response.isvalid;
    this.isMine = response.ismine;
    this.isLocked = false;
    if (response.account !== undefined) {
      this.label = response.account;
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.key.toLowerCase() === 'escape') {
      this.closeNewAddress();
    }
  }
}
