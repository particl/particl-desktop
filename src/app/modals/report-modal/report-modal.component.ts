import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss']
})
export class ReportModalComponent implements OnInit {
  public title: string = '';
  public option: boolean;
  @Output() isConfirmed: EventEmitter<string> = new EventEmitter();
  constructor(public _dialogRef: MatDialogRef<ReportModalComponent>) { }

  ngOnInit() {
  }

  flag(): void {
    this._dialogRef.close();
    this.isConfirmed.emit();
  }

  dialogClose(): void {
    this._dialogRef.close();
  }

}
