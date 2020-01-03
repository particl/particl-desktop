import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-proposal-confirmation',
  templateUrl: './proposal-confirmation.component.html',
  styleUrls: ['./proposal-confirmation.component.scss']
})
export class ProposalConfirmationComponent {
  public data: any;
  public estimateError: boolean = true;
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
    this.estimateError = data.error ? true : false;
    this.callback = callback;
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
