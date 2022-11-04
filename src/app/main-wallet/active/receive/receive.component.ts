import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of, Subject } from 'rxjs';
import { concatMap, finalize, takeUntil, tap } from 'rxjs/operators';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { AddressService } from '../../shared/address.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { AddressType } from '../../shared/address.models';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { WalletURLState } from 'app/main-wallet/shared/state-store/wallet-store.state';


interface TabModel {
  icon: string;
  type: AddressType;
  title: string;
  newAddressText: string;
  activeAddress: RPCResponses.FilterAddress;
}


enum TextContent {
  ADDRESS_COPIED = 'Address copied to clipboard',
  ERROR_INIT = 'Could not load addresses',
  ERROR_WALLET_UNLOCK = 'Error: wallet must be unlocked!',
  SUCCESS_GENERATE_ADDRESS = 'New address successfully generated',
  ERROR_GENERATE_ADDRESS = 'Failed to generate a new address!'
}


@Component({
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit, OnDestroy {

  addressUrl: string = '';
  selectedTab: FormControl = new FormControl(0);
  isLoading: boolean = true;

  readonly tabs: TabModel[] = [
    {
      icon: 'part-public',
      type: 'public',
      title: 'Public address',
      newAddressText: 'New public address',
      activeAddress: {} as RPCResponses.FilterAddress
    },
    {
      icon: 'part-anon',
      type: 'private',
      title: 'Private address',
      newAddressText: 'New private address',
      activeAddress: {} as RPCResponses.FilterAddress
    },
  ];


  private readonly DEFAULT_LABEL: string = '';
  private destroy$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _unlocker: WalletEncryptionService,
    private _snackbar: SnackbarService,
    private _receiveService: AddressService
  ) { }


  ngOnInit() {

    this._store.select(WalletURLState.get('address')).pipe(
      tap({
        next: transactionUrl => {
          this.addressUrl = typeof transactionUrl === 'string' ? transactionUrl : '';
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this._receiveService.fetchNewestAddressForAll().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(
      (result) => {
        for (const tab of this.tabs) {
          if (result[tab.type]) {
            tab.activeAddress = result[tab.type];
          }
        }
      },
      (err) => {
        this._snackbar.open(TextContent.ERROR_INIT, 'err');
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get activeAddress(): RPCResponses.FilterAddress {
    return this.tabs[this.selectedTab.value].activeAddress;
  }


  copyToClipBoard(): void {
    this._snackbar.open(TextContent.ADDRESS_COPIED);
  }


  generateAddress(addressType: AddressType) {
    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap((isUnlocked) => {
        if (!isUnlocked) {
          return of('');
        }
        return this._receiveService.generateAddress(addressType, this.DEFAULT_LABEL);
      })
    ).subscribe(
      (result: string) => {
        if (result.length > 0) {
          this._snackbar.open(TextContent.SUCCESS_GENERATE_ADDRESS);

          // Generate a new FilteredAddress object of the correct type (faking its representation in core)
          const tab = this.tabs.find(t => t.type === addressType);
          if (tab) {
            const newAddress: RPCResponses.FilterAddress = {
              address: result,
              label: this.DEFAULT_LABEL,
              owned: 'true',
              root: '',
              id: (tab.activeAddress.id || -1) + 1
            };

            tab.activeAddress = newAddress;
          }
        } else {
          this._snackbar.open(TextContent.ERROR_GENERATE_ADDRESS, 'warn');
        }
      },
      (err) => {
        this._snackbar.open(TextContent.ERROR_GENERATE_ADDRESS, 'warn');
      }
    );
  }
}
