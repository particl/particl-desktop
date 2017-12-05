import { Component, ElementRef, ViewChild } from '@angular/core';

import { SnackbarService } from '../../../../core/core.module';
import {MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss']
})
export class QrCodeModalComponent {

  public singleAddress: any = {
    label: 'Empty label',
    address: 'Empty address',
    owned: false
  };

  @ViewChild('qrCode') qrElementView: ElementRef;

  constructor(private snackbar: SnackbarService,
              public diloagRef: MatDialogRef<QrCodeModalComponent>) {
  }

  getQrSize() {
    return this.qrElementView.nativeElement.offsetWidth;
  }

  showAddress(address: string) {
    return address.match(/.{1,4}/g);
  }

  copyToClipBoard() {
    this.snackbar.open('Address copied to clipboard.', '');
  }

  dialogClose(): void {
    this.diloagRef.close();
  }

}
