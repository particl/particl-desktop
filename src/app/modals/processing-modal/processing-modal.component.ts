import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-processing-modal',
  templateUrl: './processing-modal.component.html',
  styleUrls: ['./processing-modal.component.scss']
})
export class ProcessingModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ProcessingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

}

export interface DialogData {
  message: string;
}
