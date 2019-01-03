import { Component, Output, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-reject-bid',
  templateUrl: './reject-bid.component.html',
  styleUrls: ['./reject-bid.component.scss']
})
export class RejectBidComponent implements OnInit {

  rejectMessages: RejectionMessages[] = [
    {value: 'None'},
    {value: 'Item not in stock'},
    {value: 'location'},
  ];

  constructor(
    private dialogRef: MatDialogRef<RejectBidComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
  }

  confirm(): void {
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}

export interface RejectionMessages {
  value: string;
}

export interface DialogData {
  selectedMessage: string;
}

