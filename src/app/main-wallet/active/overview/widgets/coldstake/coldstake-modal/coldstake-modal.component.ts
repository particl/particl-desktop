import { Component, Output, EventEmitter } from '@angular/core';
import { flyInOut } from 'app/core-ui/core.animations';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
// import { ValidAddressValidator } from '../coldstake.validators';


@Component({
  templateUrl: './coldstake-modal.component.html',
  styleUrls: ['./coldstake-modal.component.scss'],
  animations: [
    flyInOut()
  ],
  // providers: [ValidAddressValidator]
})
export class ColdStakeModalComponent {

  @Output() hasAddress: EventEmitter<string> = new EventEmitter();

  addressField: FormControl;

  constructor(
    private _dialogRef: MatDialogRef<ColdStakeModalComponent>,
    // private _addressValidator: ValidAddressValidator,
  ) {
    this.addressField = new FormControl('',
      [Validators.required, Validators.minLength(15)],
      // this._addressValidator.validate.bind(this._addressValidator)
    );
  }

  activate() {
    if (this.addressField.valid) {
      this.hasAddress.emit(this.addressField.value);
      this._dialogRef.close();
    }
  }
}
