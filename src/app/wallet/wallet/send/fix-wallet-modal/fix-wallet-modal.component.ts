import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-fix-wallet-modal',
  templateUrl: './fix-wallet-modal.component.html',
  styleUrls: ['./fix-wallet-modal.component.scss']
})
export class FixWalletModalComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<FixWalletModalComponent>) { }

  ngOnInit() {
  }

  fix(): void {

  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
