import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {

  label: string;
  address: string;
  validAddress: boolean = undefined;

  openNewAddressModal: boolean = false;

  constructor(private appService: AppService) { }

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

  newAddress() {
    if(this.checkAddress()) {
      console.log(this.label, this.address)
    } else {
      alert('address invalid!');
    }
  }

  verifyAddress() {
    if (this.address === undefined || this.address === '') {
      this.validAddress = undefined;
      return;
    }

    const ret = false;
    if ((this.address.indexOf('p') === 0) === false) { // does not start with p
      if ((this.address.indexOf('T') === 0) === false) { // does not start with T
        this.validAddress = false;
        return;
      } else if(this.address.length > 102) { // starts with T but over 102 chars
        this.validAddress = false;
        return;
      }
    } else if(this.address.length > 34) { // starts with p but over 34 chars
      this.validAddress = false;
      return;
    }
    // TODO: apply else if to send branch

    if (this.address.length === 34 && this.address.indexOf('p') === 0) {
      this.appService.rpc.call(this, 'validateaddress', [this.address], this.rpc_callbackVerifyAddress);
     }

    if (this.address.length === 102 && this.address.indexOf('Tet') === 0) {
      this.appService.rpc.call(this, 'validateaddress', [this.address], this.rpc_callbackVerifyAddress);
    }

    this.validAddress = undefined;
  }

  rpc_callbackVerifyAddress(JSON: Object) {
    this.validAddress = JSON['isvalid'];
   }

  checkAddress(): boolean { 
    return this.validAddress;
  }

}
