import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { SnackbarService } from '../../../../core/core.module';

@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss']
})
export class QrCodeModalComponent {

  @ViewChild('qrCode') qrElementView: ElementRef;
  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  /* UI State */
  public singleAddress: any;
  // FIXME: implement detecting of public/private addresses
  public type: string = 'public';
  constructor(
    private snackbar: SnackbarService,
    public dialogRef: MatDialogRef<QrCodeModalComponent>
  ) {}

  getQrSize(): number {
    return this.qrElementView.nativeElement.offsetWidth;
  }

  get unUsedAddress(): string {
    return this.singleAddress;
  }

  copyToClipBoard(): void {
    this.snackbar.open('Address copied to clipboard', '');
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  rpcLabelUpdate(msg: string) {
    this.onConfirm.emit(msg);
    this.dialogRef.close();
  }
}
