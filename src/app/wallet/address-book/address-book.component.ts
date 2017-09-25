import { Component, OnInit, HostListener } from '@angular/core';

import { RPCService } from '../../core/rpc/rpc.service';

import { Log } from 'ng2-logger'
import { ModalsService } from '../../modals/modals.service';

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

  // Validation state
  private validAddress: boolean = undefined;
  private isMine: boolean = undefined;

  constructor(private _rpc: RPCService, private _modals: ModalsService) { }

  ngOnInit() {
  }

  openNewAddress() {
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
    return this.validAddress && !this.isMine;
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
    if (!this.validAddress) {
      // TODO: We should get rid of alerts
      alert('Please enter a valid address!');
      return;
    }

    if (this.isMine) {
      this.clearAndClose();
      // TODO: We should get rid of alerts
      alert('This is your own address - can not be added to addressbook!');
      return;
    }

    if (this.label) {
      if (['Locked', 'Unlocked, staking only'].indexOf(this._rpc.state.get('encryptionstatus')) !== -1) {
        // unlock wallet and send transaction
        this._modals.open('unlock', {forceOpen: true, timeout: 3, callback: this.addressCallBack.bind(this)});
      } else {
        // wallet already unlocked
        this.addressCallBack();
      }
      this.closeNewAddress();
    }
  }

  private addressCallBack() {
    this._rpc.call('manageaddressbook', ['newsend', this.address, this.label])
      .subscribe(
        response => this.rpc_addAddressToBook_success(response),
        error => this.rpc_addAddressToBook_failed(error));

    this.address = undefined;
    this.validAddress = undefined;
    this.label = '';
  }

  /** Address was added succesfully to the address book. */
  rpc_addAddressToBook_success(json: Object) {
    if (json['result'] === 'success') {
      alert('Address successfully added to the addressbook!');

      // TODO: remove specialPoll! (updates the address table)
      this._rpc.specialPoll();
    }
  }

  /**
    * Address was not added to the addressbook
    * e.g: wallet still locked
    */
  rpc_addAddressToBook_failed(json: Object) {
    this.log.er('rpc_addAddressToBook_failed');
    this.log.er(json);
    // TODO: remove specialPoll! (updates the address table)
    this._rpc.specialPoll();
  }

  /** Verify if address is valid through RPC call and sets state to validAddress.. */
  verifyAddress() {
    if (this.address === undefined || this.address === '') {
      this.validAddress = undefined;
      this.isMine = undefined;
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
    */
  rpc_verifyAddress_success(json: Object) {
    this.validAddress = json['isvalid'];
    this.isMine = json['ismine'];
    if (json['account'] !== undefined) {
      this.label = json['account'];
    }
   }

    @HostListener('window:keydown', ['$event'])
    keyDownEvent(event: any) {
      if (event.key.toLowerCase() === 'escape') {
        this.closeNewAddress();
      }
    }
}
