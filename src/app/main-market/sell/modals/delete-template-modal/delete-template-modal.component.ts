import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DeleteTemplateModalInput {
  title: string;
}


@Component({
  templateUrl: './delete-template-modal.component.html',
  styleUrls: ['./delete-template-modal.component.scss']
})
export class DeleteTemplateModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DeleteTemplateModalInput,
    private _dialogRef: MatDialogRef<DeleteTemplateModalComponent>,
  ) { }


  confirmDelete() {
    this._dialogRef.close(true);
  }
}
