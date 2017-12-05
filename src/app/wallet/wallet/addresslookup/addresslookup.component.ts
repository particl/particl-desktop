import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RpcService } from '../../../core/core.module';

import { Contact } from './contact.model';
import { Log } from 'ng2-logger';
import { AddressLookUpCopy } from '../models/address-look-up-copy';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-addresslookup',
  templateUrl: './addresslookup.component.html',
  styleUrls: ['./addresslookup.component.scss']
})
export class AddressLookupComponent implements OnInit {

  @Output() selectAddressCallback: EventEmitter<AddressLookUpCopy> = new EventEmitter<AddressLookUpCopy>();

  log: any = Log.create('addresslookup.component');

  filter: string = 'All types';
  allowFilter: boolean = true;
  query: string = '';
  searchResult: Contact[];

  public type: string = 'send';
  public addressTypes: Array<string> = ['All types', 'Public', 'Private'];

  private _addressCount: number;
  addressLookups: Contact[] = [];

  // @TODO: Move static pagination prams into global variable
  MAX_ADDRESSES_PER_PAGE: number = 5;
  // PAGE_SIZE_OPTIONS: Array<number> = [5, 10, 20];
  current_page: number = 1;

  constructor(private _rpc: RpcService,
              private dialogRef: MatDialogRef) {
  }

  ngOnInit() {
    this.show();
    this.allowFilter = (this.filter === 'All types');
  }

  /** Returns a filtered addressLookups (query and filter) */
  getPageData(): Array<Object> {
    const query: string = this.query;
    this.searchResult = this.addressLookups.filter(el => (
        (  el.getLabel().toLowerCase().indexOf(query.toLowerCase()) !== -1
        || el.getAddress().toLowerCase().indexOf(query.toLowerCase()) !== -1)
        && ((this.filter === this.cheatPublicAddress(el.getAddress()))
        || (this.filter === 'All types'))
      )
    );
    return this.searchResult.slice(
      0 + ((this.current_page - 1) * this.MAX_ADDRESSES_PER_PAGE), this.current_page * this.MAX_ADDRESSES_PER_PAGE);
  }

  pageChanged(event: any) {
    if (event.pageIndex !== undefined) {
      this.MAX_ADDRESSES_PER_PAGE = event.pageSize;
      this.current_page = event.pageIndex + 1;
      this.log.d(event.pageIndex);
    }
  }

  getTotalCountForPagination() {
    return this.searchResult.length;
  }

  inSearchMode(): boolean {
    return !!this.query;
  }

  // needs to change..
  cheatPublicAddress(address: string): string {
    return address.length > 35 ? 'Private' : 'Public';
  }

  show() {
    this.rpc_update();
  }

  rpc_update() {
    this._rpc.call('filteraddresses', [-1])
      .subscribe(
        (response: any) => {
          let typeInt: string;
          if (this.type === 'send') {
            typeInt = '2';
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
                  this.addressLookups = [];
                  success.forEach((contact) => {
                    if (this.type === 'send' || contact.address.length > 35) {
                      this.addressLookups.push(new Contact(contact.label, contact.address));
                    }
                  })
                },
                error => this.log.er('error!'));
          } else {
            this.addressLookups = [];
          }

        },
        (error: any) => this.log.er('rpc_update: filteraddresses Failed!'));
  }

  onSelectAddress(address: string, label: string) {
    const emitData: AddressLookUpCopy = {address: address, label: label};
    this.selectAddressCallback.emit(emitData);
  }

  dialogClose(): void{
    this.dialogRef.close();
  }

}
