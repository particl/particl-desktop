import { Component, Input, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { RPCService } from '../../core/rpc/rpc.service';

import { Contact } from './contact.model';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-addresslookup',
  templateUrl: './addresslookup.component.html',
  styleUrls: ['./addresslookup.component.scss']
})
export class AddressLookupComponent {

  @ViewChild('staticLookup')
  public staticLookup: ModalDirective;

  @Input()
  selectAddressCallback: Function;

  log: any = Log.create('addresslookup.component');

  filter: string = 'all';
  query: string = '';

  public type: string = 'send';

  private _addressCount: number;
  addressStore: Contact[] = [];

  constructor(private _rpc: RPCService) { }

  /** Returns a filtered addressStore (query and filter) */
  page () {
    const query: string = this.query;
    return this.addressStore.filter(el => (
        (  el.getLabel()  .toLowerCase().indexOf(query.toLowerCase()) !== -1
        || el.getAddress().toLowerCase().indexOf(query.toLowerCase()) !== -1)
        && ((this.filter === this.cheatPublicAddress(el.getAddress()))
         || (this.filter === 'all'))
      )
    )
  }

  // needs to change..
  cheatPublicAddress(address: string): string {
    return address.length > 35 ? 'private' : 'public';
  }

  show(type: string) {
    this.type = type;
    this.rpc_update();
    this.staticLookup.show();
  }

  hide() {
    this.staticLookup.hide();
  }

  rpc_update() {
    this._rpc.call('filteraddresses', [-1])
      .subscribe(
        (response: any) => {
          let typeInt: string;
          if (this.type === 'send') {
            typeInt = '2'
            this._addressCount = response.num_send;
          } else {
            this.filter = 'private';
            typeInt = '1';
            this._addressCount = response.num_receive;
          }
          if (this._addressCount > 0) {
            this._rpc.call('filteraddresses', [0, this._addressCount, '0', '', typeInt])
              .subscribe(
                (success: any) => {
                  this.addressStore = [];
                  success.forEach((contact) => {
                    if (this.type === 'send' || contact.address.length > 35) {
                      this.addressStore.push(new Contact(contact.label, contact.address));
                    }
                  })
                },
                error => this.log.er('error!'));
          } else {
            this.addressStore = [];
          }

        },
        (error: any) => this.log.er('rpc_update: filteraddresses Failed!'));
  }

}
