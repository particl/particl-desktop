import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, of} from 'rxjs';
import { takeUntil, filter, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AddressService } from '../../../shared/address.service';
import { FilteredAddress, AddressType } from '../../../shared/address.models';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SignVerifyAddressModalComponent } from '../../../shared/sign-verify-address-modal/sign-verify-address-modal.component';
import { AddressDetailModalComponent } from '../../../shared/address-detail-modal/address-detail-modal.component';
import { PageFilter } from '../../../shared/shared.models';


enum TextContent {
  ADDRESS_COPIED = 'Address copied to clipboard'
};


@Component({
  selector: 'receive-history',
  templateUrl: './receive-history.component.html',
  styleUrls: ['./receive-history.component.scss']
})
export class ReceiveHistoryComponent implements OnChanges, OnInit, OnDestroy {

  @Input() activeAddress: FilteredAddress;
  @ViewChild('paginator', {static: false}) paginator: any;
  @ViewChild('scroll', {static: false}) scrollContainer: any;

  isVisible: FormControl = new FormControl(false);
  searchQuery: FormControl = new FormControl('');
  isLoading: boolean = true;
  filteredAddresses: FilteredAddress[] = [];

  private destroy$: Subject<void> = new Subject();
  private loader$: Subject<void> = new Subject();
  private filter$: Subject<void[]> = new Subject();
  private _addresses: FilteredAddress[] = [];

  readonly pageFilters: PageFilter = {
    pageSizes: [10, 25, 50],
    pageSize: 10,
    currentPage: 0,
    resultsTotalCount: 0
  };


  constructor(
    private _addressService: AddressService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) {}


  ngOnInit() {

    // @TODO: zaSMilingIdiot (2020-02-13) -> This implementation is not the best way to tbe doing this, but it works for now.
    //    Should probably be updated when more time is available...

    this.isVisible.valueChanges.pipe(
      filter((visible: boolean) => visible),
      tap(() => {
        this.loader$.next();
        setTimeout(() => {
          if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollIntoView(true);
          }
        }, 0)
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.loader$.pipe(
      filter(() => this.isVisible.value),
      tap(() => {
        this.isLoading = true
      }),
      switchMap(() => this.loadAddresses()),
      takeUntil(this.destroy$)
    ).subscribe(
      (addresses) => {
        this._addresses = addresses;
        this.filter$.next();
      }
    );

    this.searchQuery.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => this.filter$.next()),
      takeUntil(this.destroy$)
    ).subscribe();

    this.filter$.pipe(
      filter(() => this.isVisible.value),
      switchMap(() => {
        const query = this.searchQuery.value;
        const addresses = this.searchQuery.value.length === 0 ?
          this._addresses.filter(addr => addr.address !== this.activeAddress.address) :
          this._addresses.filter(addr =>
           typeof addr.label === 'string' ? addr.label.includes(query) : false
          );

        this.isLoading = false;
        return of(addresses);
      }),
      takeUntil(this.destroy$)
    ).subscribe(
      (addresses) => {
        this.pageFilters.resultsTotalCount = addresses.length;
        let startIdx = this.pageFilters.currentPage * this.pageFilters.pageSize;

        if ((startIdx >= addresses.length)) {
          this.pageFilters.currentPage = 0;
          startIdx = 0;

          if (this.paginator) {
            this.paginator.resetPagination(0);
          }
        }
        this.filteredAddresses = addresses.slice(startIdx, startIdx + this.pageFilters.pageSize);
      }
    );
  }


  ngOnChanges(changes: SimpleChanges) {
    if ('activeAddress' in changes &&
        (typeof changes.activeAddress.currentValue === 'object') &&
        changes.activeAddress.currentValue.address &&
        changes.activeAddress.currentValue.address.length
    ) {
      const current: FilteredAddress = changes.activeAddress.currentValue;
      const prev: FilteredAddress = changes.activeAddress.previousValue;

      if (!prev) {
        return;
      }
      if (current.address !== prev.address) {
        // new address must have been generated, so load up addresses again
        this.loader$.next();
      }
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.loader$.complete();
    this.filter$.complete();
  }


  get pageSize(): number {
    return this.pageFilters.pageSize;
  }

  get pageOptions(): number[] {
    return this.pageFilters.pageSizes;
  }


  trackByAddressFn(idx: number, item: FilteredAddress) {
    return item.address;
  }


  copyToClipBoard() {
    this._snackbar.open(TextContent.ADDRESS_COPIED, '');
  }


  openAddressDetailModal(address: FilteredAddress) {
    this._dialog.open(AddressDetailModalComponent, {data: {address}});
  }


  openSignatureModal(address: FilteredAddress) {
    this._dialog.open(SignVerifyAddressModalComponent, {data: {address, type: 'sign'}});
  }


  paginatorChangeHandler(event: any): void {
    if (typeof event.pageSize === 'number') {
      this.pageFilters.pageSize = Math.floor(event.pageSize);
    }
    if (typeof event.pageIndex === 'number') {
      this.pageFilters.currentPage = Math.floor(event.pageIndex);
    }
    this.filter$.next();
  }


  private loadAddresses(): Observable<FilteredAddress[]> {
    const addrType: AddressType = this.activeAddress.address.length >= 35 ? 'private' : 'public';
    return this._addressService.fetchOwnAddressHistory(addrType);
  }
}
