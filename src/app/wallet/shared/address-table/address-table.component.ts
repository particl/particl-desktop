import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { AddressBookService } from '../address-book.service';
import { Log } from 'ng2-logger'
import {Address} from '../../../core/rpc/models/address.model';
import {AddressCount} from 'app/core/rpc/models/address-count.model';

@Component({
  selector: 'address-table',
  templateUrl: './address-table.component.html',
  styleUrls: ['./address-table.component.scss']
})
export class AddressTableComponent implements OnInit {

  log: any = Log.create('address-table.component');

  @Input() addresses: Address[] = [];
  @Input() addressCount: AddressCount = new AddressCount();
  @Output() remove: EventEmitter<Address> = new EventEmitter();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter();

  /* header and utils */
  @Input() displayHeader: boolean = true;
  @Input() displayInternalHeader: boolean = false;
  @Input() displayToolsMenu: boolean = true;
  @Input() displayQrMenu: boolean = true;
  @Input() displayPagination: boolean = false;

  /* actual fields */
  @Input() displayLabel: boolean = true;
  @Input() displayType: boolean = false;
  @Input() displayAddress: boolean = true;
  @Input() displayPublicKey: boolean = false;
  @Input() displayPurpose: boolean = false;
  @Input() displayIsMine: boolean = false;

  constructor(public addressBookService: AddressBookService) {
  }

  ngOnInit() {
  }

  /**
   * Invoked whenever the page changes via a click on one of the pagination controls.
   *
   * newPage: {page: 2, itemsPerPage: 9}
   *
   * @param newPage
   */
  public onPageChanged(newPage: any): void {
    this.log.d('onPageChanged, newPage: ', newPage);
    this.pageChanged.emit(newPage)
    // this.addressBookService.changePage(event.page);
  }

  public onClickRemoveAddress(address: Address) {
    this.log.d('onClickRemoveAddress, address: ', address);
    this.remove.emit(address);
  }

}
