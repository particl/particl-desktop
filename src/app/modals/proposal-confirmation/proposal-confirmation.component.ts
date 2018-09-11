import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Amount } from 'app/core/util/utils';

@Component({
  selector: 'app-proposal-confirmation',
  templateUrl: './proposal-confirmation.component.html',
  styleUrls: ['./proposal-confirmation.component.scss']
})
export class ProposalConfirmationComponent {
  public data: any;
  private callback: any;

  constructor(private dialogRef: MatDialogRef<ProposalConfirmationComponent>) { }

  confirm(): void {

    // check to prevent this.callback = null?.
    if (this.callback) {
      this.callback();
    }
  }

  /**
   * setData sets the callback information for ProposalConfirmationComponent.
   */

  setData(data: any, callback: Function): void {
    this.data = data;
    this.callback = callback;
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
