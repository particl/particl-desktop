import { Component, OnInit, Input } from '@angular/core';
import { AddressTableService } from './address.table.service';

@Component({
  selector: 'app-address-table',
  templateUrl: './address.table.component.html',
  styleUrls: ['./address.table.component.css'],
  providers: [AddressTableService]
})
export class AddressTableComponent implements OnInit {


  addressService;
  /* Determines what fields are displayed in the Transaction Table. */
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

  constructor(private _addressService: AddressTableService) {
    this.addressService = _addressService;
  }

  ngOnInit() {
  }

  public pageChanged(event:any):void {
    this.addressService.changePage(event.page);
  }
}
