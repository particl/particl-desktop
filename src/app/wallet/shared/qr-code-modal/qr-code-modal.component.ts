import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss']
})
export class QrCodeModalComponent implements OnInit {

  public singleAddress: any = {
    label: 'Empty label',
    address: 'Empty address',
    owned: false
  };

  @ViewChild('qrCode') qrElementView: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  getQrSize() {
    return this.qrElementView.nativeElement.offsetWidth - 40;
  }

  showAddress(address: string) {
    return  address.match(/.{1,4}/g);
  }

}
