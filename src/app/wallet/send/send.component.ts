import { Component, OnInit, ViewChild } from '@angular/core';

import { AddressLookupComponent } from '../addresslookup/addresslookup.component';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent implements OnInit {

  @ViewChild('addressLookup')
  public addressLookup: AddressLookupComponent;

  type: string = 'sendPayment';
  advanced: boolean = false;
  lookup: string;

  send: any = {
    fromType: 'public',
    toType: 'public',
    currency: 'part',
    privacy: 50
  };

  constructor() { }

  ngOnInit() {
    /*
    document.onkeydown = evt => {
      if (evt.key.toLowerCase() === 'escape') {
        this.closeLookup();
      }
    }*/
  }

  sendTab(type: string) {
    this.type = type;
  }

  toggleAdvanced() {
    this.advanced = !this.advanced;
  }

  getBalance(account: string) {
    if (account === 'public') {
      return (12345);
    }
    if (account === 'private') {
      return (54321);
    }
  }

  openLookup() {
    this.addressLookup.show();
  }

  openValidate() {
    document.getElementById('validate').classList.remove('hide');
  }

  closeValidate() {
    document.getElementById('validate').classList.add('hide');
  }

  selectAddress(address: string, label: string) {
    this.send.toAddress = address;
    this.send.toLabel = label;
    this.addressLookup.hide();
  }

  clear() {
    this.send = {
      fromType: 'public',
      toType: 'public',
      currency: 'part',
      privacy: 50
    };
  }

  pay() {
    console.log(this.type, this.send);
    this.clear();
    this.closeValidate();
  }

}
