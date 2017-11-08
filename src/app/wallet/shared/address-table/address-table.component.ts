import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { AddressService } from '../address.service';
import { Address } from '../address.model';

import { RPCService } from '../../../core/rpc/rpc.module';
import { MdDialog } from '@angular/material';
import { QrCodeModalComponent} from '../qr-code-modal/qr-code-modal.component';
import { DeleteConfirmationModalComponent } from '../../../shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { FlashNotificationService } from '../../../services/flash-notification.service';
import { ModalsService } from '../../../modals/modals.service';
import { SignatureAddressModalComponent } from '../signature-address-modal/signature-address-modal.component';

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

  // Search query
  @Input() query: string;

  // Data storage
  private addresses: Address[] = [];
  private _subAddresses: Subscription;
  public singleAddress: any = {
    label: 'Empty label',
    address: 'Empty address',
    owned: false
  };
  // Pagination
  currentPage: number = 1;
  @Input() addressDisplayAmount: number = 5;
  PAGE_SIZE_OPTIONS: Array<number> = [5, 10, 20];
  MAX_ADDRESSES_PER_PAGE: number = 5;

  log: any = Log.create('address-table.component');

  constructor(
    public _addressService: AddressService,
    private _rpc: RPCService,
    public dialog: MdDialog,
    public flashNotification: FlashNotificationService,
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

  /** Delete address */

  public deleteAddress(label: string, address: string) {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent);
    dialogRef.componentInstance.dialogContent = `${label}: ${address}`;
    dialogRef.componentInstance.onDelete.subscribe(() => {
      if (this._rpc.state.get('locked')) {
        // unlock wallet and send transaction
        this._modals.open('unlock', {
          forceOpen: true, timeout: 3, callback: this.deleteAddressCallBack.bind(this, address)
        });
      } else {
        // wallet already unlocked
        this.deleteAddressCallBack(address);
      }
    });
  }

  private deleteAddressCallBack(address: string) {
    this._rpc.call('manageaddressbook', ['del', address])
      .subscribe(response => {
          this.rpc_deleteAddress_success(response);
        },
        error => console.log(`${error.error.message}`));
  }

  private rpc_deleteAddress_success(json: Object) {
    this.flashNotification.open(`Succesfully deleted ${json['address']}`);
    // this._rpc.specialPoll();
    this._addressService.updateAddressList();
  }

  /** Edit label address */
  editLabel(address: string) {
    this.log.d(`editLabel, address: ${address}`);
    this.editLabelEmitter.emit(address);
  }

  /** Open QR Code Modal */
  openQrCodeModal(address: Object) {
    const dialogRef = this.dialog.open(QrCodeModalComponent);
    dialogRef.componentInstance.singleAddress = address;
    this.log.d(`qrcode, address: ${JSON.stringify(address)}`);
  }

  showAddress(address: string) {
    return  address.match(/.{1,4}/g);
  }

  pageChanged(event: any) {
    if (event.pageIndex !== undefined) {
      this.MAX_ADDRESSES_PER_PAGE = event.pageSize;
      this.currentPage = event.pageIndex + 1;
      this.log.d(event.pageIndex);
    }
  }

  copyToClipBoard() {
    this.flashNotification.open('Address copied to clipboard.', '');
  }

  openSignatureModal(address: string): void {
    const dialogRef = this.dialog.open(SignatureAddressModalComponent);
    dialogRef.componentInstance.formData.address = address;
    dialogRef.componentInstance.type = 'verify';
  }
}

