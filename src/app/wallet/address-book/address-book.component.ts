import { Component, OnInit } from '@angular/core';

import { RPCService } from '../../core/rpc/rpc.service';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {

  label: string = '';
  address: string;
  private validAddress: boolean = undefined;

  openNewAddressModal: boolean = false;

  constructor(private _rpc: RPCService) { }

  ngOnInit() {
    document.onkeydown = evt => {
      if (evt.key.toLowerCase() === 'escape') {
        this.closeNewAddress();
      }
    }
  }

  openNewAddress() {
    this.openNewAddressModal = true;
  }

  closeNewAddress() {
    this.openNewAddressModal = false;
  }

  addAddressToBook() {
    if (this.validAddress && this.label !== undefined) {

      this._rpc.call(this, 'manageaddressbook', ['add', this.address, this.label],
        this.rpc_addAddressToBook_success, this.rpc_addAddressToBook_failed);

      this.address = undefined;
      this.validAddress = undefined;
      this.label = '';
      this.closeNewAddress();
    } else {
      alert('Please enter a valid address!');
    }
  }

  rpc_addAddressToBook_success(json: Object) {
    console.log('rpc_addAddressToBook_success: yayaya')
    if (json['result'] === 'success') {
      alert('Address successfully added to the addressbook!');

      // TODO: remove specialPoll!
      this._rpc.specialPoll();
    }
  }

  rpc_addAddressToBook_failed(json: Object) {
    console.log('rpc_addAddressToBook_failed');
    console.log(json);
  }

  verifyAddress() {
    if (this.address === undefined || this.address === '') {
      this.validAddress = undefined;
      return;
    }

    this._rpc.call(this, 'validateaddress', [this.address], this.rpc_verifyAddress_success);
    return;
  }

  rpc_verifyAddress_success(json: Object) {
    this.validAddress = json['isvalid'];
   }

  checkAddress(): boolean {
    return this.validAddress;
  }

}
