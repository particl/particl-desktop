import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subject, Observable, merge, of } from 'rxjs';
import { takeUntil, startWith, switchMap, debounceTime, tap, distinctUntilChanged } from 'rxjs/operators';
import { AddressService } from '../shared/address.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { AddressType, FilteredAddress } from '../shared/address.models';
import { DeleteAddressConfirmationModalComponent } from './delete-address-confirmation-modal/delete-address-confirmation-modal.component';
import { NewAddressbookEntryModalComponent } from './new-addressbook-entry-modal/new-addressbook-entry-modal.component';
import { SignVerifyAddressModalComponent } from '../shared/sign-verify-address-modal/sign-verify-address-modal.component';
import { AddressDetailModalComponent } from '../shared/address-detail-modal/address-detail-modal.component';


type SelectableAddressType = AddressType | 'all';


interface TableFilter {
  text: string;
  value: SelectableAddressType;
}


interface PageFilter {
  currentPage: number;
  pageSize: number;
  pageSizes: number[];
  resultsTotalCount: number;
};


enum TextContent {
  ADDRESS_LOAD_ERROR = 'Failed to update the addresses',
  ADDRESS_COPIED = 'Address copied to clipboard'
}


@Component({
  templateUrl: './addressbook.component.html',
  styleUrls: ['./addressbook.component.scss']
})
export class AddressBookComponent implements OnInit, OnDestroy {

  @ViewChild('paginator', {static: false}) paginator: any;

  isLoading: boolean = true;
  displayedResults: FilteredAddress[] = [];
  searchQuery: FormControl = new FormControl('');
  filterQuery: FormControl = new FormControl('all');

  readonly pageFilters: PageFilter = {
    currentPage: 0,
    pageSize: 50,
    pageSizes: [10, 25, 50],
    resultsTotalCount: 0,
  };

  readonly tableFilters: TableFilter[] = [
    { text: 'Show all addresses', value: 'all' },
    { text: 'Public only', value: 'public' },
    { text: 'Private only', value: 'private' },
  ];

  private destroy$: Subject<void> = new Subject();
  private pagination$: Subject<void> = new Subject();
  private _allAddresses: FilteredAddress[] = [];
  /**
   *  Seems there's a tradeoff between the delay and processing involved when querying the core for
   *    search results vs memory consumption of storing filtered and searched results. Seems to be due to the way the pagination works.
   *  Also, there's the additional requirement of searching labels as well as addresses, whereas core seems to only search labels.
   *  Hence, the _searchAddresses option is used here to store the search results.
  */
  private _searchedAddresses: FilteredAddress[] = [];


  constructor(
    private _addressService: AddressService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    const filter$ = this.filterQuery.valueChanges.pipe(
      startWith('all'),
      tap(() => this.isLoading = true),
      switchMap((selectedValue: SelectableAddressType) => this.loadAddresses(selectedValue)),
      takeUntil(this.destroy$)
    );


    const search$ = this.searchQuery.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    merge(
      filter$,
      search$
    ).pipe(

      switchMap(() => {
        return this.doSearchAddresses(<string>this.searchQuery.value).pipe(
          tap((searchResult: FilteredAddress[]) => {
            this.isLoading = false;
            this.pageFilters.currentPage = 0;
            if (this.paginator) {
              this.paginator.resetPagination(0);
            }
            this.pageFilters.resultsTotalCount = searchResult.length;
            this._searchedAddresses = searchResult;
          })
        );
      }),

      takeUntil(this.destroy$)
    ).subscribe(
      () => this.pagination$.next(),
      (err) => this._snackbar.open(TextContent.ADDRESS_LOAD_ERROR, 'err')
    );


    this.pagination$.pipe(
      tap(() => {
        const startIdx = this.pageFilters.currentPage * this.pageFilters.pageSize;
        this.displayedResults = this._searchedAddresses.slice(startIdx, startIdx + this.pageFilters.pageSize);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.pagination$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByFiltersFn(idx: number, item: TableFilter) {
    return idx;
  }

  displayedAddressTrackFn(idx: number, item: FilteredAddress) {
    return item.address;
  }


  copyToClipBoard() {
    this._snackbar.open(TextContent.ADDRESS_COPIED, '');
  }


  addNewAddress() {
    const addModal = this._dialog.open(NewAddressbookEntryModalComponent);
    addModal.componentInstance.isAdded.subscribe(
      (success: boolean) => {
        if (success) {
          // Force a refresh to update the list of addresses found.
          this.filterQuery.setValue(this.filterQuery.value);
        }
      }
    );
  }


  openQrCodeModal(address: FilteredAddress) {
    this._dialog.open(AddressDetailModalComponent, {data: {address}});
  }


  openSignatureModal(address: FilteredAddress) {
    this._dialog.open(SignVerifyAddressModalComponent, {data: {address, type: 'verify'}});
  }


  deleteAddress(address: FilteredAddress) {
    const delModal = this._dialog.open(DeleteAddressConfirmationModalComponent, {data: {address}});
    delModal.componentInstance.isDeleted.subscribe(
      (success: boolean) => {
        if (success && (this._allAddresses.findIndex(ad => ad.address === address.address) > -1)) {
          // Force a refresh to update the list of addresses found.
          this.filterQuery.setValue(this.filterQuery.value);
        }
      }
    );
  }


  paginatorChangeHandler(event: any): void {
    if (typeof event.pageSize === 'number') {
      this.pageFilters.pageSize = Math.floor(event.pageSize);
    }
    if (typeof event.pageIndex === 'number') {
      this.pageFilters.currentPage = Math.floor(event.pageIndex);
    }

    this.pagination$.next();
  }


  private loadAddresses(addrType: SelectableAddressType): Observable<FilteredAddress[]> {
    return this._addressService.fetchUnownedAddressHistory(addrType).pipe(
      tap((result) => {
        this._allAddresses = result;
      }),
    );
  }


  private doSearchAddresses(searchTerm: string): Observable<FilteredAddress[]> {
    const searchString = searchTerm.toLowerCase();
    const filteredAddresses = this._allAddresses.filter(
      (address) =>  ((typeof address.label === 'string') && (address.label.toLowerCase().indexOf(searchString) !== -1)) ||
                    ((typeof address.address === 'string') && (address.address.toLowerCase().indexOf(searchString) !== -1))
    );

    return of(filteredAddresses);
  }
}
