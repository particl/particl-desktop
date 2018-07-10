import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-proposal-vote-confirmation',
  templateUrl: './proposal-vote-confirmation.component.html',
  styleUrls: ['./proposal-vote-confirmation.component.scss']
})
export class ProposalVoteConfirmationComponent implements OnInit {


  public dialogContent: string;

  constructor(private dialogRef: MatDialogRef<ProposalVoteConfirmationComponent>) {
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
