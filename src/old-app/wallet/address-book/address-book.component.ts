import { Component } from '@angular/core';
import { MdDialog } from '@angular/material';
import { NewAddressModalComponent } from './modal/new-address-modal/new-address-modal.component';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent {

  log: any = Log.create('address-book.component');
  public query: string;
  constructor(private dialog: MdDialog) {
  }

  openNewAddress(): void {
    const dialogRef = this.dialog.open(NewAddressModalComponent);
  }

  editLabel(address: string): void {
    this.log.d(`editLabel, address: ${address}`);
    const dialogRef = this.dialog.open(NewAddressModalComponent);
    dialogRef.componentInstance.address = address;
    dialogRef.componentInstance.isEdit = true;
  }
}
