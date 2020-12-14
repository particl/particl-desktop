import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { takeUntil, tap, finalize, switchMap, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';

import { BuyShippingProfilesService } from './buy-shipping-profiles.service';
import { EditShippingProfileModalComponent, EditedActionResponse, EditedAddressAction } from './edit-shipping-profile-modal/edit-shipping-profile-modal.component';
import { ShippingAddress } from '../../shared/shipping-profile-address-form/shipping-profile-address.models';
import { isBasicObjectType } from '../../shared/utils';


@Component({
  selector: 'market-buy-shipping-profiles',
  templateUrl: './buy-shipping-profiles.component.html',
  styleUrls: ['./buy-shipping-profiles.component.scss'],
  providers: [BuyShippingProfilesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyShippingProfilesComponent implements OnInit, OnDestroy {


  searchQuery: FormControl = new FormControl('');
  isLoading: boolean = true;
  displayedAddressList: ShippingAddress[] = [];


  private destroy$: Subject<void> = new Subject();
  private allAddressList: ShippingAddress[] = [];
  private updated$: FormControl = new FormControl();


  constructor(
    private _addressesService: BuyShippingProfilesService,
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
  ) { }


  ngOnInit() {

    const search$ = merge(
      this.searchQuery.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this.updated$.valueChanges.pipe(
        takeUntil(this.destroy$)
      )
    ).pipe(
      switchMap(() => of({}).pipe(tap(() => {
        this.displayedAddressList = this.searchAddresses(this.searchQuery.value);
        this._cdr.detectChanges();
      }))),
      takeUntil(this.destroy$)
    );

    const init$ = this._addressesService.fetchOwnAddresses().pipe(
      tap((addresses) => {
        this.allAddressList = addresses;
        this.displayedAddressList = this.allAddressList;
      }),
      finalize(() => {
        this.isLoading = false;
        this._cdr.detectChanges();
      })
    );

    merge(
      search$,
      init$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByAddressFn(idx: number, item: ShippingAddress) {
    return item.id;
  }


  openEditShippingProfileModal(displayIdx: number): void {
    let srcAddress = null;
    if ((displayIdx >= 0) && (displayIdx < this.displayedAddressList.length)) {
      srcAddress = this.displayedAddressList[displayIdx];
    }
    const dialogConfig: MatDialogConfig<EditShippingProfileModalComponent> = new MatDialogConfig();
    dialogConfig.data = srcAddress;
    const dialog = this._dialog.open(EditShippingProfileModalComponent, dialogConfig);
    dialog.afterClosed().pipe(
      take(1)
    ).subscribe(
      (addrResponse: EditedActionResponse | null | undefined) => {
        if (isBasicObjectType(addrResponse) &&
            (isBasicObjectType(addrResponse.address) || addrResponse.action === EditedAddressAction.DELETED)
        ) {
          let isModified = true;

          switch (addrResponse.action) {
            case EditedAddressAction.CREATED:
              if (addrResponse.address) {
                this.allAddressList.unshift(addrResponse.address);
              }
              break;
            case EditedAddressAction.DELETED:
              const existingIdx = srcAddress ? this.allAddressList.findIndex(a => a.id === srcAddress.id) : -1;
              if (existingIdx > -1) {
                this.allAddressList.splice(existingIdx, 1);
              }
              break;
            case EditedAddressAction.UPDATED:
              if (addrResponse.address) {
                const updateAddrIdx = this.allAddressList.findIndex(a => a.id === addrResponse.address.id);
                if (updateAddrIdx > -1) {
                  this.allAddressList[updateAddrIdx] = addrResponse.address;
                }
              }
              break;
            default:
              isModified = false;
          }

          if (isModified) {
            this.updated$.setValue(true);
          }
        }
      }
    );
  }


  private searchAddresses(lookup: string): ShippingAddress[] {
    const search = lookup.toLowerCase();
    return this.allAddressList.filter(addr =>
      addr.title.toLowerCase().includes(search) ||
      addr.firstName.toLowerCase().includes(search) ||
      addr.lastName.toLowerCase().includes(search) ||
      addr.country.toLowerCase().includes(search) ||
      addr.addressLine1.toLowerCase().includes(search)
    );
  }

}
