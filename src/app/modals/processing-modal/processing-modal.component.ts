import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

interface DialogData {
  message: string;
}

@Component({
  selector: 'app-processing-modal',
  templateUrl: './processing-modal.component.html',
  styleUrls: ['./processing-modal.component.scss']
})
export class ProcessingModalComponent {

  constructor(public dialogRef: MatDialogRef<ProcessingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

}
