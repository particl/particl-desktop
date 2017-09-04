import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { RPCService } from '../../core/rpc/rpc.service';

import { Contact } from './contact.model';
import { Log } from 'ng2-logger';

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

  log: any = Log.create('addresslookup.component');
  /*
    UI logic
  */

  filter: string = 'all';
  query: string = '';

  /*
    RPC data
  */
  private _addressCount: number;
  addressStore: Contact[] = [];


  constructor(private _rpc: RPCService) {
    this.rpc_update();
  }


  /*

    UI functions

  */

  /**
  * Returns a filtered addressStore (query and filter)
  * @return Array
  */
  page () {
    const query: string = this.query;
    return this.addressStore.filter(el => {
      return ((
        el.getLabel().toLowerCase().indexOf(query.toLowerCase()) !== -1
        || el.getAddress().toLowerCase().indexOf(query.toLowerCase()) !== -1)
        && ((this.filter === this.cheatPublicAddress(el.getAddress()))
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
    // this._rpc.oldCall(this, 'filteraddresses', [-1], this.rpc_loadAddressCount_success, this.rpc_loadAddressCount_failed);
    this._rpc.call('filteraddresses', [-1])
      .subscribe(response => {
        this.rpc_loadAddressCount_success(response)
      },
      (error: any) => {
        this.rpc_loadAddressCount_failed(error);
      });
  }

  /**
    Successfully loaded address count
  */
  rpc_loadAddressCount_success(json: Object): void {
    this._addressCount = json['num_send'];

    if (this._addressCount > 0) {
      // this._rpc.oldCall(this, 'filteraddresses', [0, this._addressCount, '0', '', '2'], this.rpc_loadAddresses_success);
      this._rpc.call('filteraddresses', [0, this._addressCount, '0', '', '2'])
        .subscribe(response => {
          this.rpc_loadAddresses_success(response)
        },
        error => {
          this.log.er('error!');
        });
    } else {
      this.addressStore = [];
    }

  }

  /**
    Failed to load the address count
  */
  rpc_loadAddressCount_failed(json: any): void {
    this.log.er('rpc_loadAddressCount_failed!');
  }

  /**
    Callback that loads addresses into addressStore!
  */
  rpc_loadAddresses_success(json: any) {
    this.addressStore = json.map((contact) => new Contact(contact['label'], contact['address']));
  }


}
