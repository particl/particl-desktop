import { Component, OnInit, Input } from '@angular/core';
import { AddressTableService } from './address.table.service';

@Component({
  selector: 'app-address-table',
  templateUrl: './address.table.component.html',
  styleUrls: ['./address.table.component.css'],
  providers: [AddressTableService]
})
export class AddressTableComponent implements OnInit {


  /* Determines what fields are displayed in the Transaction Table. */
    /* header and utils */
  @Input() displayHeader: boolean = true;
  @Input() displayPagination: boolean = false;

    /* actual fields */
  @Input() displayLabel: boolean = true;
  @Input() displayType: boolean = true;
  @Input() displayAddress: boolean = true;
  @Input() displayPurpose: boolean = false;
  @Input() displayIsMine: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
