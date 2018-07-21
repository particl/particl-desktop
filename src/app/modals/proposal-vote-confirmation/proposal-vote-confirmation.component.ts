import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-proposal-vote-confirmation',
  templateUrl: './proposal-vote-confirmation.component.html',
  styleUrls: ['./proposal-vote-confirmation.component.scss']
})
export class ProposalVoteConfirmationComponent implements OnInit {
  public data: any;
  public callback: Function;
  public dialogContent: string;

  constructor(private dialogRef: MatDialogRef<ProposalVoteConfirmationComponent>) {
  }

  ngOnInit() {
  }

  setData(data: any, callback: Function) {
    console.log('data', data);
    this.data = data;
    this.callback = callback;
  }

  confirm(): void {
    this.dialogClose();
    this.callback();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
