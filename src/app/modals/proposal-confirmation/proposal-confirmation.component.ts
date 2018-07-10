import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-proposal-confirmation',
  templateUrl: './proposal-confirmation.component.html',
  styleUrls: ['./proposal-confirmation.component.scss']
})
export class ProposalConfirmationComponent implements OnInit {


  public dialogContent: string;

  constructor(private dialogRef: MatDialogRef<ProposalConfirmationComponent>) {
  }

  ngOnInit() {
  }

  confirm(): void {
    // this.onConfirm.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
