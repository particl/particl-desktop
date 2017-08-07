import { Component, OnInit } from '@angular/core';

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

  /*
    UI state
  */
  label: string = '';
  address: string;
  openNewAddressModal: boolean = false;

  /*
    Validation state
  */
  private validAddress: boolean = undefined;
  private isMine: boolean = undefined;

  constructor(private _rpc: RPCService) { }

  ngOnInit() {
    document.onkeydown = evt => {
      if (evt.key.toLowerCase() === 'escape') {
        this.closeNewAddress();
      }
    }
  }

  /*

    UI Logic

  */


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

  /**
  * Returns if the entered address is valid or not AND if it is not ours (isMine).
  */
  checkAddress(): boolean {
    return this.validAddress && !this.isMine;
  }

  /*

    RPC Logic

  */


  /*
    Add address to addressbook
  */

  editLabel(address: string) {
    this.log.d(`editLabel, address: ${address}`);
    this.address = address;
    this.verifyAddress();
    this.openNewAddress();
  }
  /**
  * Adds the address to the addressbook if address is valid & has label (in UI textbox) AND is not one of our own addresses.
  */
  addAddressToBook() {
    if (!this.validAddress) {
      alert('Please enter a valid address!');
      return;
    }

    if (this.isMine) {
      this.clearAndClose();
      alert('This is your own address - can not be added to addressbook!');
      return;
    }

    if (this.label !== undefined) {

      this._rpc.call(this, 'manageaddressbook', ['newsend', this.address, this.label],
        this.rpc_addAddressToBook_success,
        this.rpc_addAddressToBook_failed
      );

      this.address = undefined;
      this.validAddress = undefined;
      this.label = '';
      this.closeNewAddress();
    }
  }

  /**
  * Address was added succesfully to the address book.
  */
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




  /*
    Verify address
  */


  /**
  * Verify if address is valid through RPC call and set state to validAddress..
  */
  verifyAddress() {
    if (this.address === undefined || this.address === '') {
      this.validAddress = undefined;
      this.isMine = undefined;
      return;
    }

    this._rpc.call(this, 'validateaddress', [this.address], this.rpc_verifyAddress_success);
    return;
  }

  /**
  * Callback of verifyAddress, sets state.
  */
  rpc_verifyAddress_success(json: Object) {
    this.validAddress = json['isvalid'];
    this.isMine = json['ismine'];
    if (json['account'] !== undefined) {
      this.label = json['account'];
    }
   }

}
