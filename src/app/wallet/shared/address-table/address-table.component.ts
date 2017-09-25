import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { AddressService } from '../address.service';
import { Address } from '../address.model';

import { RPCService } from '../../../core/rpc/rpc.module';
import { ModalsService } from '../../../modals/modals.service';

@Component({
  selector: 'address-table',
  templateUrl: './address-table.component.html',
  styleUrls: ['./address-table.component.scss']
})
export class AddressTableComponent implements OnInit {

  // Determines what fields are displayed in the Transaction Table.
  // header and utils
  @Input() displayHeader: boolean = true;
  @Input() displayInternalHeader: boolean = false;
  @Input() displayToolsMenu: boolean = true;
  @Input() displayQrMenu: boolean = true;
  @Input() displayPagination: boolean = false;

  // actual fields
  @Input() displayLabel: boolean = true;
  @Input() displayType: boolean = false;
  @Input() displayAddress: boolean = true;
  @Input() displayPublicKey: boolean = false;
  @Input() displayPurpose: boolean = false;
  @Input() displayIsMine: boolean = false;

  @Output() editLabelEmitter: EventEmitter<string> = new EventEmitter<string>();
  openQrModal: boolean = false;

  // Search query
  @Input() query: string;

  @ViewChild('qrCode') qrElementView: ElementRef;

  // Data storage

  private addresses: Address[] = [];
  private _subAddresses: Subscription;
  public singleAddress: any = {
    label: 'Empty label',
    address: 'Empty address',
    owned: false
  };
  public address: string;
  // Pagination
  currentPage: number = 1;
  @Input() addressDisplayAmount: number = 5;

  log: any = Log.create('address-table.component');

  constructor(
    public _addressService: AddressService,
    private _rpc: RPCService,
    private _modals: ModalsService
  ) {

  }

  ngOnInit() {
    this._subAddresses = this._addressService.getAddresses()
      .subscribe(
        addresses => this.addresses = addresses,
        error => console.log('addresstable-component subscription error:' + error));
  }

  /** Returns the addresses to display in the UI with regards to both pagination and search/query. */
  public getSinglePage(): Array<Address> {
    if (this.inSearchMode()) { // in search mode
      return this.paginateArray(this.getSearchSubset());
    } else { // not in seach mode
      return this.paginateArray(this.addresses);
    }
  }

  private inSearchMode(): boolean {
    return (this.query !== undefined && this.query !== '');
  }

  /** Returns the addresses that match a search/query. */
  private getSearchSubset(): Address[] {
    return this.addresses.filter(el => {
        return (
          el.label.toLowerCase().indexOf(this.query.toLowerCase()) !== -1
          || el.address.toLowerCase().indexOf(this.query.toLowerCase()) !== -1
        );
      });
  }

  /** Returns the addresses to display in the UI with regards to the pagination parameters */
  private paginateArray(tempAddresses: Address[]): Address[] {
    if (tempAddresses !== undefined) {
      return tempAddresses.slice(((this.currentPage - 1) * this.addressDisplayAmount), this.currentPage * this.addressDisplayAmount);
    } else {
      return [];
    }
  }

  public getTotalAddressCount(): number {
    if (this.inSearchMode()) {
      return this.getSearchSubset().length;
    } else {
      return this.addresses.length;
    }
  }

  public getMaxAddressesPerPage(): number {
    return this.addressDisplayAmount;
  }

  public getQrSize() {
    return this.qrElementView.nativeElement.offsetWidth - 40;
  }

  /** Delete address */

  public deleteAddress(label: string, address: string) {
    this.address = address;
    if (confirm(`Are you sure you want to delete ${label}: ${address}`)) {
      // this._rpc.call(this, 'manageaddressbook', ['del', address], this.rpc_deleteAddress_success);
      if (['Locked', 'Unlocked, staking only'].indexOf(this._rpc.state.get('encryptionstatus')) !== -1) {
        // unlock wallet and send transaction
        this._modals.open('unlock', {forceOpen: true, timeout: 3, callback: this.deleteAddressCallBack.bind(this)});
      } else {
        // wallet already unlocked
        this.deleteAddressCallBack();
      }
    }
  }

  private deleteAddressCallBack() {
    this._rpc.call('manageaddressbook', ['del', this.address])
      .subscribe(response => {
          this.rpc_deleteAddress_success(response);
        },
        error => console.log(`${error.error.message}`));
  }

  private rpc_deleteAddress_success(json: Object) {
    alert(`Succesfully deleted ${json['address']}`);
    this._rpc.specialPoll();
  }

  /** Edit label address */
  editLabel(address: string) {
    this.log.d(`editLabel, address: ${address}`);
    this.editLabelEmitter.emit(address);
  }

  /** Open QR Code Modal */
  openQrCodeModal(address: Object) {
    this.log.d(`qrcode, address: ${JSON.stringify(address)}`);
    this.openQrModal = true;
    this.singleAddress = address
  }

  closeQrModal() {
    this.openQrModal = false;
  }

  showAddress(address: string) {
    return  address.match(/.{1,4}/g);
  }
  @HostListener('window:keydown', ['$event'])
    keyDownEvent(event: any) {
      if (event.key.toLowerCase() === 'escape') {
        this.openQrModal = false;
      }
    }
}

