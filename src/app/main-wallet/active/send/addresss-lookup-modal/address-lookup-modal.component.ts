import { Component, EventEmitter, OnInit, Output, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Observable, Subject, of, merge } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AddressService } from '../../../shared/address.service';
import { SelectableAddressType } from '../../../shared/address.models';
import { PageFilter } from '../../../shared/shared.models';
import { SavedAddress } from '../send.models';


@Component({
  templateUrl: './address-lookup-modal.component.html',
  styleUrls: ['./address-lookup-modal.component.scss']
})
export class AddressLookupModalComponent implements OnInit, OnDestroy {

  @ViewChild('paginator', {static: false}) paginator: any;
  @Output() addressSelected: EventEmitter<SavedAddress> = new EventEmitter<SavedAddress>();

  queryFilter: FormControl = new FormControl('');
  typeFilter: FormControl = new FormControl('');
  displayedAddresses: SavedAddress[] = [];


  readonly typeFilters: Array<{label: string, value: SelectableAddressType}> = [
    { label: 'Show all address types', value: 'all' },
    { label: 'Public addresses only', value: 'public' },
    { label: 'Private addresses only', value: 'private' }
  ];

  readonly pageFilters: PageFilter = {
    currentPage: 0,
    pageSize: 10,
    pageSizes: [10, 25, 50],
    resultsTotalCount: 0,
  };

  private destroy$: Subject<void> = new Subject();
  private pagination$: Subject<void> = new Subject();
  private _allAddresses: SavedAddress[] = [];
  private searchAddresses: SavedAddress[] = [];


  constructor(
    private _dialogRef: MatDialogRef<AddressLookupModalComponent>,
    private _addressService: AddressService
  ) {}

  ngOnInit() {
    const query$ = this.queryFilter.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const filter$ = this.typeFilter.valueChanges.pipe(
      distinctUntilChanged(),
      switchMap(() => this._addressService.fetchSavedContacts().pipe(
        tap((addresses: SavedAddress[]) => {
          const selectedType = this.typeFilter.value;
          this._allAddresses = selectedType === 'all' ? addresses : addresses.filter(a => a.type === selectedType);
        })
      )),
      takeUntil(this.destroy$)
    );

    merge(query$, filter$).pipe(
      switchMap(() => {
        return this.doSearchAddresses(<string>this.queryFilter.value).pipe(
          tap((searchResult: SavedAddress[]) => {
            this.pageFilters.currentPage = 0;
            this.pageFilters.resultsTotalCount = searchResult.length;
            if (this.paginator) {
              this.paginator.resetPagination(0);
            }
            this.searchAddresses = searchResult;
          })
        );
      }),

      takeUntil(this.destroy$)
    ).subscribe(
      () => this.pagination$.next()
    );


    this.pagination$.pipe(
      tap(() => {
        const startIdx = this.pageFilters.currentPage * this.pageFilters.pageSize;
        this.displayedAddresses = this.searchAddresses.slice(startIdx, startIdx + this.pageFilters.pageSize);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.typeFilter.setValue('all');
  }


  ngOnDestroy() {
    this.pagination$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  displayedAddressTrackFn(idx: number, item: SavedAddress) {
    return item.address;
  }


  paginatorChangeHandler(event: any) {
    if (typeof event.pageSize === 'number') {
      this.pageFilters.pageSize = Math.floor(event.pageSize);
    }
    if (typeof event.pageIndex === 'number') {
      this.pageFilters.currentPage = Math.floor(event.pageIndex);
    }

    this.pagination$.next();
  }


  onSelectAddress(address: SavedAddress) {
    this.addressSelected.emit(address);
    this._dialogRef.close();
  }


  private doSearchAddresses(searchTerm: string): Observable<SavedAddress[]> {
    const searchString = searchTerm.toLowerCase();
    const filteredAddresses = this._allAddresses.filter(
      (address) =>  ((typeof address.label === 'string') && (address.label.toLowerCase().indexOf(searchString) !== -1)) ||
                    ((typeof address.address === 'string') && (address.address.toLowerCase().indexOf(searchString) !== -1))
    );

    return of(filteredAddresses);
  }
}
