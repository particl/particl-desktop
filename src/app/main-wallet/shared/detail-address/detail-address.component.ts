import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Log } from 'ng2-logger';
import { concatMap, mapTo, finalize } from 'rxjs/operators';
import { iif, of } from 'rxjs';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { AddressService } from '../address.service';
import { AddressType } from '../address.models';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { AddressHelper } from 'app/core/util/utils';


enum TextContent {
  DEFAULT_EMPTY_LABEL = '(No Label)',
  ADDRESS_COPIED = 'Address copied to clipboard',
  UPDATE_SUCCESS = 'Label for ${address} updated',
  UPDATE_FAILED = 'Failed to update label!',
  WIDGET_HELP_PUBLIC_OWN = 'This is your public address - its balance and transaction history is publicly visible on blockchain. If you would like to increase your privacy, use Private address instead.',
  WIDGET_HELP_PRIVATE_OWN = 'This is your private address - its balance and transaction history is hidden for public on blockchain. For auditable addresses, use Public addresses instead.',
  WIDGET_HELP_PUBLIC_OTHER = '3rd-party\'s Public address (not yours) - any payments made to this address will be publicly visible on the blockchain. For increased privacy, you should ask the recipient for their Private address instead.',
  WIDGET_HELP_PRIVATE_OTHER = '3rd-party\'s Private address (not yours) - any payments made to this address will be hidden for public on the blockchain.',
}


@Component({
  selector: 'detail-address',
  templateUrl: './detail-address.component.html',
  styleUrls: ['./detail-address.component.scss']
})
export class DetailAddressComponent implements OnChanges {

  @Input() address: RPCResponses.FilterAddress;
  @Output() updatedEmitter: EventEmitter<RPCResponses.FilterAddress> = new EventEmitter();

  widgetHelpText: string = '';
  isEditing: boolean = false;
  newLabel: string = '';


  private log: any = Log.create('detail-address.component');
  private _addressType: AddressType = 'public';
  private _addressParts: string[] = [];

  constructor(
    private _snackbar: SnackbarService,
    private _unlocker: WalletEncryptionService,
    private _addressService: AddressService
  ) {}


  ngOnChanges(changes: SimpleChanges) {
    if ('address' in changes) {
      const address: RPCResponses.FilterAddress = changes.address.currentValue;
      this._addressType = (new AddressHelper()).getAddressType(address.address as AddressType) as AddressType;
      this.isEditing = false;
      this.newLabel = address.label || '';

      if (this.newLabel === '') {
        this.newLabel = TextContent.DEFAULT_EMPTY_LABEL;
      }

      if (typeof address.address === 'string') {
        this._addressParts = address.address.match(/.{1,4}/g);
      }

      switch (true) {
        case (this.addressType === 'public') && (address.owned === 'true'):
          this.widgetHelpText = TextContent.WIDGET_HELP_PUBLIC_OWN;
          break;
        case (this.addressType === 'private') && (address.owned === 'true'):
          this.widgetHelpText = TextContent.WIDGET_HELP_PRIVATE_OWN;
          break;
        case (this.addressType === 'public') && (address.owned === 'false'):
          this.widgetHelpText = TextContent.WIDGET_HELP_PUBLIC_OTHER;
          break;
        case (this.addressType === 'private') && (address.owned === 'false'):
          this.widgetHelpText = TextContent.WIDGET_HELP_PRIVATE_OTHER;
          break;
        default:
          this.widgetHelpText = '';
      }
    }
  }


  get addressType(): AddressType {
    return this._addressType;
  }


  get addressParts(): string[] {
    return this._addressParts;
  }

  trackByAddressPartFn(idx: number, item: string) {
    return idx;
  }


  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.newLabel = this.address.label;
    if (!this.isEditing && (this.newLabel === '')) {
      this.newLabel = TextContent.DEFAULT_EMPTY_LABEL;
    }
  }


  updateLabel() {
    if (this.address.label === this.newLabel) {
      if (this.newLabel === '') {
        this.newLabel = TextContent.DEFAULT_EMPTY_LABEL;
      }
      this.isEditing = !this.isEditing;
      return;
    }

    this._unlocker.unlock({timeout: 5}).pipe(
      concatMap((isUnlocked: boolean) => iif(() =>
        !isUnlocked,
        of(false),
        this._addressService.updateAddressLabel(this.address.address, this.newLabel).pipe(mapTo(true))
      )),
      finalize(() => {
        this.isEditing = this.address.label !== this.newLabel;
      })
    ).subscribe(
      (success) => {
        if (success) {
          this.address.label = this.newLabel;
          this.updatedEmitter.emit(this.address);
          this._snackbar.open(TextContent.UPDATE_SUCCESS.replace('${address}', this.address.address), 'success');
        }
      },
      (err) => {
        this.log.er('Failed to change label: ', err);
        this._snackbar.open(TextContent.UPDATE_FAILED, 'warn');
      }
    );
  }


  copyToClipBoard(): void {
    this._snackbar.open(TextContent.ADDRESS_COPIED, 'success');
  }
}
