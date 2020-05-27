import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  templateUrl: './delete-template-modal.component.html',
  styleUrls: ['./delete-template-modal.component.scss']
})
export class DeleteTemplateModalComponent {

  @Output() isConfirmed: EventEmitter<void> = new EventEmitter();

  constructor(
    private _dialogRef: MatDialogRef<DeleteTemplateModalComponent>,
  ) { }


  confirmDelete() {
    this.isConfirmed.emit();
    this._dialogRef.close();
  }
}
