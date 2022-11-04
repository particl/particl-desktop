import { Injectable } from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressService } from '../../../shared/address.service';


@Injectable()
export class NotOwnAddressValidator implements AsyncValidator {


  constructor(private _addressService: AddressService) {}


  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this._addressService.getAddressInfo(ctrl.value).pipe(
      catchError(() => of(null)),
      map((resp: RPCResponses.GetAddressInfo | null) => {
        if (resp === null) {
          return {notOwnAddress: 'failed to validate address'};
        }
        if (resp.ismine) {
          return {notOwnAddress: 'Your own address may not be used'};
        }
        return null;
      })
    );
  }

}
