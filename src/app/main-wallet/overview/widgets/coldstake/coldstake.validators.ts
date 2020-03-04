import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressService } from '../../../shared/address.service';
import { ValidatedAddress } from '../../../shared/address.models';
import { AddressHelper } from 'app/core/util/utils';


@Injectable()
export class ValidAddressValidator implements AsyncValidator {

  private addressHelper: AddressHelper = new AddressHelper();

  constructor(private _addressService: AddressService) {}

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!ctrl.value || ctrl.value.length < 15) { // || !this.addressHelper.testAddress(ctrl.value, 'public')) {
      // fail early if necessary to prevent unnecessary expensive rpc call
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
