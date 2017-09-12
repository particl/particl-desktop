import { Component } from '@angular/core';
import { MdDialog } from '@angular/material';
import { NewAddressModalComponent } from './modal/new-address-modal/new-address-modal.component';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent {

  public query: string;
  constructor(private dialog: MdDialog) {
  }

  openNewAddress(): void {
    const dialogRef = this.dialog.open(NewAddressModalComponent);
  }
}
