import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { NewAddressModalComponent } from './modal/new-address-modal/new-address-modal.component';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';


@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent {

  log: any = Log.create('address-book.component');
  public query: string;
  constructor(private dialog: MatDialog,
              private flashNotificationService: SnackbarService) {
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
    const address = event.clipboardData.getData('text');
    if (/^[pPrRTt][a-km-zA-HJ-NP-Z1-9]{25,}$/.test(address)) {
      if (!this.dialog.openDialogs.length) {
        this.editLabel(address);
        this.dialog.openDialogs[0].componentInstance.isEdit = false;
        this.flashNotificationService.open('This is your own address - can not be added to Address book!');
      }
    }
  }
}
