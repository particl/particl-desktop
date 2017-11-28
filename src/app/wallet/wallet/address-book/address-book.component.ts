import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { NewAddressModalComponent } from './modal/new-address-modal/new-address-modal.component';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent {

  log: any = Log.create('address-book.component');
  public query: string;
  constructor(private dialog: MatDialog) {
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

  @HostListener('document:paste', ['$event'])
  onPaste(event) {
    const address = event.clipboardData.getData('text');
    if (/^[pPrRTt][a-km-zA-HJ-NP-Z1-9]{25,}$/.test(address)) {
      if (!this.dialog.openDialogs.length) {
        this.editLabel(address);
        this.dialog.openDialogs[0].componentInstance.isEdit = false;
      }
    }
  }
}
