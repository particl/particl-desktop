import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { NewAddressModalComponent } from './modal/new-address-modal/new-address-modal.component';
import { AddressHelper } from '../../shared/util/utils';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent {

  log: any = Log.create('address-book.component');
  public query: string;
  private addressHelper: AddressHelper;
  constructor(
    private dialog: MatDialog) {
    this.addressHelper = new AddressHelper();
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
  onPaste(event: any) {
    if (!this.dialog.openDialogs.length) {
      const address = this.addressHelper.addressFromPaste(event);
      if (!address) {
        return;
      }
      this.editLabel(address);
      this.dialog.openDialogs[0].componentInstance.isEdit = false;
    }
  }
}
