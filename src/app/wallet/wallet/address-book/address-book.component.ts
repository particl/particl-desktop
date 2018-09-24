import { Component, HostListener } from '@angular/core';
import { MatDialog, MatSelectChange } from '@angular/material';
import { Log } from 'ng2-logger';

import { NewAddressModalComponent } from './modal/new-address-modal/new-address-modal.component';
import { AddressHelper } from '../../../core/util/utils';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent {

  log: any = Log.create('address-book.component');

  public query: string;
  public filter: RegExp;
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

  filterType(event: MatSelectChange): void {
    switch (event && event.value) {
      case 'public':
        this.filter = /^[pPrR25][a-km-zA-HJ-NP-Z1-9]{25,52}$/;
        break;
      case 'private':
        this.filter = /^[Tt][a-km-zA-HJ-NP-Z1-9]{60,}$/;
        break;
      default: this.filter = undefined;
    }
  }
}
