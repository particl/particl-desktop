import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-wallet-fixed-confirmation',
  templateUrl: './wallet-fixed-confirmation.component.html',
  styleUrls: ['./wallet-fixed-confirmation.component.scss']
})
export class WalletFixedConfirmationComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<WalletFixedConfirmationComponent>,
  ) { }

  ngOnInit() {
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
