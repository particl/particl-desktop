import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-addresslookup',
  templateUrl: './addresslookup.component.html',
  styleUrls: ['./addresslookup.component.scss']
})
export class AddressLookupComponent implements OnInit {

  @ViewChild('staticLookup')
  public staticLookup: ModalDirective;

  @Input()
  selectAddressCallback: Function;

  filterAddress: string;

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
  }

  show() {
    this.staticLookup.show();
  }

  hide() {
    this.staticLookup.hide();
  }

}
