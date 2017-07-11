import { Component, OnInit, Input } from '@angular/core';
import { AddressService } from '../address.service';
import { Log } from 'ng2-logger'

@Component({
  selector: 'address-table',
  templateUrl: './address-table.component.html',
  styleUrls: ['./address-table.component.scss']
})

/**
 * ngx-datatable styling: https://swimlane.gitbooks.io/ngx-datatable/introduction/themes.html
 */
export class AddressTableComponent implements OnInit {

  log: any = Log.create('address-table.component');

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

  rows: Array<any> = [];  // TODO: type
  columns: any = [
    { name: 'Label',      sortable: true },
    { name: 'Address',    sortable: false },
    { name: 'Public key', sortable: false },
    { name: 'Type',       sortable: true },
    { name: 'Purpose',    sortable: false },
    { name: 'Tools',      sortable: false },
    { name: 'QR Code',    sortable: false }
  ];

  constructor(public addressService: AddressService) {

    this.getAddresses((data) => {
      this.log.d('data:', data);
      this.rows = data; // .splice(0, 5);
    });

  }

  ngOnInit() {
  }

  public pageChanged(event: any): void {
    this.addressService.changePage(event.page);
  }

  getAddresses(cb: Function) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/address-list.json');

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }


}
