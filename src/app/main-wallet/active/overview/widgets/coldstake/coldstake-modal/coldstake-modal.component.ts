import { Component, Output, EventEmitter } from '@angular/core';
import { flyInOut } from 'app/core-ui/core.animations';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';


@Component({
  templateUrl: './coldstake-modal.component.html',
  styleUrls: ['./coldstake-modal.component.scss'],
  animations: [
    flyInOut()
  ],
})
export class ColdStakeModalComponent {

  @Output() hasAddress: EventEmitter<string> = new EventEmitter();

  addressField: FormControl;

  constructor(
    private _dialogRef: MatDialogRef<ColdStakeModalComponent>,
  ) {
    this.addressField = new FormControl('',
      [Validators.required, Validators.minLength(15)],
    );
  }

  activate() {
    if (this.addressField.valid) {
      this.hasAddress.emit(this.addressField.value);
      this._dialogRef.close();
    }
  }
}
