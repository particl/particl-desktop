import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss']
})
export class DeleteConfirmationModalComponent implements OnInit {

  public dialogContent: string;

  @Output() onDelete: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dialogRef: MatDialogRef<DeleteConfirmationModalComponent>) { }

  ngOnInit(): void {
    this.dialogContent = (this.dialogContent) ? this.dialogContent : 'This item';
  }

  onConfirmDelete(): void {
    this.onDelete.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
