import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent implements OnInit {

  type: string = 'sendPayment';
  advanced: boolean = false;
  lookup: string;
  send: any = {
    fromType: 'public',
    toType: 'public',
    currency: 'part',
    privacy: 50
  };

  lookupAddresses: any = [
    {
      label: 'testLabel',
      address: 'sdfkjy34876ftks7fy847ydewi8uxndi3w8u',
      publicKey: 'oq3847dro847xrnqox874nrxoq746rcnqo34876xoq347xnq3xno3487',
      type: 'public'
    },
    {
      label: 'testLabel2',
      address: 'sdfkjy34876ftks7fy847ydewi8uxndi3w8u',
      publicKey: 'oq3847dro847xrnqox874nrxoq746rcnqo34876xoq347xnq3xno3487',
      type: 'public'
    }
  ];

  constructor() { }

  ngOnInit() {
    document.onkeydown = evt => {
      if (evt.key.toLowerCase() === 'escape') {
        this.closeLookup();
      }
    }
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
    document.getElementById('address-modal').classList.remove('hide');
  }

  closeLookup() {
    document.getElementById('address-modal').classList.add('hide');
  }

  selectAddress(address: string, label: string) {
    this.send.toAddress = address;
    this.send.toLabel = label;
    this.closeLookup();
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
  }

}
