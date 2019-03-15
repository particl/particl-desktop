import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { RpcStateService, SnackbarService } from '../../../../core/core.module';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss']
})
export class QrCodeModalComponent implements OnInit {

  @ViewChild('qrCode') qrElementView: ElementRef;
  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  /* UI State */
  public singleAddress: any;
  public type: string = 'public';
  testnet: boolean = false;
  constructor(
    private snackbar: SnackbarService,
    public dialogRef: MatDialogRef<QrCodeModalComponent>,
    public rpcState: RpcStateService
  ) {}

  ngOnInit(): void {
    this.rpcState.observe('getblockchaininfo', 'chain').pipe(take(1))
     .subscribe(chain => this.testnet = chain === 'test');
  }

  getQrSize(): number {
    return this.qrElementView.nativeElement.offsetWidth;
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
