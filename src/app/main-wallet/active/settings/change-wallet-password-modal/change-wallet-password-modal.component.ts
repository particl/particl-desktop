import { tap, catchError } from 'rxjs/operators';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

import { Observable, of, defer } from 'rxjs';

import { Select } from '@ngxs/store';
import { WalletInfoState } from 'app/main/store/main.state';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ChangeWalletPasswordService } from './change-wallet-password.service';


enum TextContent {
  CHANGE_SUCCESS = 'Password successfully changed',
  CHANGE_ERROR_GENERIC = 'Failed to change the password',
  ChANGE_ERROR_INVALID_CURRENT = 'Current password is incorrect',
}


const matchingFieldValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.get('value');
  const confirm = control.get('confirm');
  return value && confirm && value.value === confirm.value ? null : { matchingField: true };
};


const unchangedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.get('current');
  const confirm = (control.get('newPasswords') as FormGroup).get('value');
  return value && confirm && (value.value === confirm.value) && !!value.value ? { unchanged: true } : null;
};


@Component({
  templateUrl: './change-wallet-password-modal.component.html',
  styleUrls: ['./change-wallet-password-modal.component.scss'],
  providers: [ChangeWalletPasswordService]
})
export class ChangeWalletPasswordModalComponent {

  @Select(WalletInfoState.getValue('walletname')) walletName: Observable<string>;

  showCurrent: boolean = false;
  showNew: boolean = false;


  passwordForm: FormGroup = new FormGroup({
    current: new FormControl('', [Validators.required]),
    newPasswords: new FormGroup({
      value: new FormControl('', [Validators.required, Validators.minLength(3)]),
      confirm: new FormControl('', [Validators.required])
    }, { validators: matchingFieldValidator })
  }, { validators: unchangedValidator });


  private changeAction$: Observable<boolean> = defer(() => {
    if (this.passwordForm.disabled || this.passwordForm.invalid) {
      return of(false);
    }

    this.passwordForm.disable();

    return this._changeService.changeWalletPassphrase(
      <string>this.passwordForm.get('current').value,
      (this.passwordForm.get('newPasswords') as FormGroup).get('value').value
    ).pipe(
      tap((success) => {
        if (success) {
          this._snackbar.open(TextContent.CHANGE_SUCCESS);
          this._dialog.close();
          return;
        }
        throw new Error('Failed changing password');
      }),
      catchError((error) => {
        let errMsg = TextContent.CHANGE_ERROR_GENERIC;
        if (error && Object.prototype.toString.call(error) === '[object Object]' && typeof error.code === 'number') {
          if (error.code === -14) {
            errMsg = TextContent.ChANGE_ERROR_INVALID_CURRENT;
          }
        }
        this.passwordForm.enable();
        this._snackbar.open(errMsg, 'warn');
        return of(false);
      })
    );

  });


  constructor(
    private _dialog: MatDialogRef<ChangeWalletPasswordModalComponent>,
    private _changeService: ChangeWalletPasswordService,
    private _snackbar: SnackbarService
  ) { }


  get newPasswordsForm(): FormGroup {
    return this.passwordForm.controls['newPasswords'] as FormGroup;
  }


  doAction(): void {
    this.changeAction$.subscribe();
  }


}
