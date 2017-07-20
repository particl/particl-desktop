import {Component, OnDestroy, OnInit} from '@angular/core';
import { Log } from 'ng2-logger'
import { AddressService } from '../shared/address.service';
import { Address } from '../../core/rpc/models/address.model';
import { AddressCount } from '../../core/rpc/models/address-count.model';
import { AddressType } from '../../core/rpc/models/address-type.enum';
import {Subscription} from 'rxjs/Subscription';


@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss'],
  providers: [AddressService]
})
export class AddressBookComponent implements OnInit, OnDestroy {

  log: any = Log.create('address-book.component');

  addressesSubscription: Subscription;
  addressCountSubscription: Subscription;

  addresses: Address[] = [];
  addressCount: AddressCount = new AddressCount();

  // addressbook pagination state
  currentPage: number = 1; // 1 -> first page
  addressType: AddressType = AddressType.total;

  // address-table configuration
  itemsPerPage: number = 9; // TODO: move this to external config
  displayHeader: boolean = false;
  displayInternalHeader: boolean = true;
  displayPagination: boolean = true;
  displayLabel: boolean = true;
  displayAddress: boolean = true;
  displayPublicKey: boolean = false;
  displayType: boolean = true;
  displayPurpose: boolean = true;
  displayToolsMenu: boolean = true;
  displayQrMenu: boolean = true;

  constructor(private addressService: AddressService) {
  }

  ngOnInit() {

    // update the addressCount
    this.addressCountSubscription = this.updateAddressCount();

    // get initial addresses using default settings
    this.addressesSubscription = this.addressService
      .findAddresses(this.getPaginationParams(this.addressType, this.currentPage))
      .subscribe(
        (addresses) => {
          this.addresses = addresses;
        }
      );
  }

  ngOnDestroy() {
    this.addressesSubscription.unsubscribe();
    this.addressCountSubscription.unsubscribe();
  }

  /**
   * returns the correct parameters for findAddresses.
   * @param page, starts from 1!
   * @returns {any}
   */
  getPaginationParams(addressType: AddressType, page: number): Array<any> {
    page = page !== 0 ? page - 1 : 0;
    const offset: number = (page * this.itemsPerPage);
    const count: number = this.itemsPerPage;

    this.log.d('getPaginationParams(), page: ', page);
    this.log.d('getPaginationParams(), offset: ', offset);
    this.log.d('getPaginationParams(), count: ', count);
    this.log.d('getPaginationParams(), addressType: ', addressType);

    if (addressType === AddressType.receive) {
      return [offset, count, '0', '', '1'];
    } else if (addressType === AddressType.send) {
      return [offset, count, '0', '', '2'];
    } else if (addressType === AddressType.total) {  // total means all, match_owned = 0
      return [offset, count, '0', '', '0'];
    }

    // we should never end up here
    return [offset, count];
  }

  /**
   * update addressCount
   */
  updateAddressCount() {
    return this.addressService
      .getAddressCount()
      .subscribe(
        (addressCount) => {
          this.addressCount = addressCount;
        }
      );
  }

  /**
   * called when remove event from the address-table is received
   * TODO: not really deleting any addresses
   * @param address
   */
  onRemoveAddress(address: Address) {
    this.log.d('onRemoveAddress(), address: ', address);

    const addressToRemove = address.address;

    this.addressService
      .removeAddress(addressToRemove)
      .subscribe(
        (_) => {
          this.addresses = this.addresses.filter((t) => t.address !== addressToRemove);
        }
      );
  }

  public onClickNewAddress() {
    this.log.d('onClickNewAddress, not implemented');

    // TODO: create new address
  }

  public onClickSearchAddressBook() {
    this.log.d('onClickSearchAddressBook, not implemented');

    // TODO: create new address
  }

  /**
   * update the addresses based on the page number received
   *
   * newPage: {page: 2, itemsPerPage: 9}
   *
   * @param newPage
   */
  public onPageChanged(newPage: any): void {
    this.log.d('onPageChanged, newPage: ', newPage);

    this.currentPage = newPage.page;

    // get initial addresses using default settings
    this.addressesSubscription = this.addressService
      .findAddresses(this.getPaginationParams(this.addressType, this.currentPage))
      .subscribe(
        (addresses) => {
          this.addresses = addresses;
        }
      );
  }

}
