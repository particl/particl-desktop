import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { RPCService } from '../../core/rpc/rpc.service';

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

  /*
    UI logic
  */

  filter: string = 'all';
  query: string = '';

  /*
    RPC data
  */
  private _addressCount: number;
  addressStore: any = [

  ];


  constructor(private _rpc: RPCService) {
    this.rpc_update();
  }


  /*

    UI functions

  */

  page () {
    const query: string = this.query;
     return this.addressStore.filter(el => {
      return ((
        el.label.toLowerCase().indexOf(query.toLowerCase()) !== -1
        || el.address.toLowerCase().indexOf(query.toLowerCase()) !== -1)
        && ((this.filter === this.cheatPublicAddress(el.address))
              || (this.filter === 'all')
            )
      );
    })
  }

  // needs to change..
  cheatPublicAddress(address: string) {
    if (address.indexOf('p') === 0) {
      return 'public';
    } else {
      return 'private';
    }
  }

  ngOnInit() {
  }

  show() {
    this.staticLookup.show();
  }

  hide() {
    this.staticLookup.hide();
  }

  /*

    RPC functions

  */

  rpc_update() {
    this._rpc.call(this, 'filteraddresses', [-1], this.rpc_loadAddressCount_success, this.rpc_loadAddressCount_failed);
  }

  /*
    Load address count
  */
  rpc_loadAddressCount_success(json: Object): void {
    this._addressCount = json['num_send'];

    if (this._addressCount > 0) {
      this._rpc.call(this, 'filteraddresses', [0, this._addressCount, '0', '', '2'], this.rpc_loadAddresses_success);
    } else {
      this.addressStore = undefined;
    }

  }

  rpc_loadAddressCount_failed(json: Object): void {
    console.log('Shit,failed!' + json);
  }
  /*
    Load addresses into lookupAddresses!
  */
  rpc_loadAddresses_success(json: Array<Object>) {
    this.addressStore = json;
  }


}
