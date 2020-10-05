import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';


@Component({
  templateUrl: './identity-add-details-modal.component.html',
  styleUrls: ['./identity-add-details-modal.component.scss']
})
export class IdentityAddDetailsModalComponent {

  readonly MAX_NAME: number = 50;
  identityName: FormControl = new FormControl('', [Validators.minLength(1), Validators.maxLength(this.MAX_NAME)]);

  constructor(
    private _dialogRef: MatDialogRef<IdentityAddDetailsModalComponent>,
  ) { }


  doAction() {
    if (this.identityName.invalid) {
      return;
    }

    const modalResponse: string = this.identityName.value;

    this._dialogRef.close(modalResponse);
  }

}
