import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss']
})
export class DeleteConfirmationModalComponent implements OnInit {

  public dialogContent: string;

  @Output() onDelete = new EventEmitter();

  constructor(private diloagRef: MdDialogRef<DeleteConfirmationModalComponent>) { }

  ngOnInit(): void {
    this.dialogContent = (this.dialogContent) ? this.dialogContent : 'This item';
  }

  onConfirmDelete(): void{
    this.onDelete.emit();
  }
}
