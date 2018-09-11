import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-proposal-vote-confirmation',
  templateUrl: './proposal-vote-confirmation.component.html',
  styleUrls: ['./proposal-vote-confirmation.component.scss']
})
export class ProposalVoteConfirmationComponent {
  public data: any;
  public callback: Function;

  constructor(private dialogRef: MatDialogRef<ProposalVoteConfirmationComponent>) {
  }

  setData(data: any, callback: Function) {
    this.data = data;
    this.callback = callback;
  }

  confirm(): void {
    this.dialogClose();

    // check to prevent this.callback = null?.
    if (this.callback) {
      this.callback();
    }
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
