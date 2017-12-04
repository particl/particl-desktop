import { Component, ElementRef, ViewChild } from '@angular/core';
import { FlashNotificationService } from '../../../services/flash-notification.service';

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

  constructor(private flashNotification: FlashNotificationService) {
  }

  getQrSize() {
    return this.qrElementView.nativeElement.offsetWidth;
  }

  showAddress(address: string) {
    return address.match(/.{1,4}/g);
  }

  copyToClipBoard() {
    this.flashNotification.open('Address copied to clipboard.', '');
  }

}
