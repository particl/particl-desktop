import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressService } from '../../shared/address.service';
import { ValidatedAddress } from '../../shared/address.models';
import { TabType, TxType } from './send.models';
import { AddressHelper } from 'app/core/util/utils';


export function targetTypeValidator(currentTab: TabType, sourceType: TxType): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if ((currentTab === 'transfer') &&
        ((control.value === undefined) || (sourceType === undefined) || (sourceType === control.value))
    ) {
        return { 'targetType': true };
    }
    return null;
  };
}


export function amountRangeValidator(max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (
      (typeof max !== 'number') ||
      (typeof +control.value !== 'number') ||
      (!+control.value) ||
      (+control.value < 1e-8) ||
      (+control.value > max) ||
      ((`${control.value}`.split('.')[1] || '').length > 8)
    ) {
        return { 'amountRange': true };
    }
    return null;
  };
}


export function publicAddressUsageValidator(currentTab: TabType, sourceType: TxType) {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    // Ensure that a public address is not used for private transactions
    if ((currentTab === 'send') &&
        (!control.value || (sourceType !== 'part' && (new AddressHelper().testAddress(control.value, 'public'))))
    ) {
        return { 'publicAddressUsage': true };
    }
    return null;
  };
}


@Injectable()
export class ValidAddressValidator implements AsyncValidator {

  constructor(private _addressService: AddressService) {}

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!ctrl.value || ctrl.value.length < 15) {
      return of({validAddress: false});
    }

    return this._addressService.validateAddress(`${ctrl.value}`).pipe(
      catchError(() => of(null)),
      map((resp: ValidatedAddress | null) => {
        if (resp === null || !resp.isvalid) {
          return {validAddress: false}
        }
        return null;
      })
    );
  }
}
