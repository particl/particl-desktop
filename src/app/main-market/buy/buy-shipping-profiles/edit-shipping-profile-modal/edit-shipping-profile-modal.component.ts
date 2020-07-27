import { Component, Inject, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA , } from '@angular/material/dialog';
import { Observable, combineLatest, of } from 'rxjs';
import { map, tap, mapTo, catchError, startWith } from 'rxjs/operators';

import { BuyShippingProfilesService } from '../buy-shipping-profiles.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ShippingProfileAddressFormComponent } from 'app/main-market/shared/shipping-profile-address-form/shipping-profile-address-form.component';
import { isBasicObjectType } from '../../../shared/utils';
import { ShippingAddress } from 'app/main-market/shared/shipping-profile-address-form/shipping-profile-address.models';


enum TextContent {
  CREATE_FAILED = 'Could not create the address due to an error',
  UPDATE_FAILED = 'Could not update the address due to an error',
  DELETE_FAILED = 'Could not remove the address due to an error'
}


export enum EditedAddressAction {
  CREATED,
  UPDATED,
  DELETED,
  NO_CHANGE
}


export interface EditedActionResponse {
  action: EditedAddressAction;
  address: ShippingAddress;
}


@Component({
  templateUrl: './edit-shipping-profile-modal.component.html',
  styleUrls: ['./edit-shipping-profile-modal.component.scss'],
  providers: [BuyShippingProfilesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditShippingProfileModalComponent {


  readonly address: ShippingAddress = {
    id: 0,
    title: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    countryCode: '',
    state: '',
    zipCode: '',
    country: ''
  };
  titleField: FormControl = new FormControl('', [Validators.required, Validators.maxLength(100)]);
  isFormValid: FormControl = new FormControl(true);
  isActionable: Observable<boolean>;
  isNew: boolean = true;


  private canAction: FormControl = new FormControl(true);
  @ViewChild(ShippingProfileAddressFormComponent, {static: false}) private addressForm: ShippingProfileAddressFormComponent;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShippingAddress,
    public _dialogRef: MatDialogRef<EditShippingProfileModalComponent>,
    private _addressService: BuyShippingProfilesService,
    private _snackbar: SnackbarService
  ) {
    if (isBasicObjectType(this.data)) {
      const srcKeys = Object.keys(this.data);
      for (const key of srcKeys) {
        if ((key in this.address) && (typeof this.address[key] === typeof this.data[key])) {
          this.address[key] = this.data[key];
        }
      }
    }

    this.isNew = this.address.id === 0;
    this.titleField.setValue(this.address.title);

    const fieldValid$: Observable<boolean> = combineLatest(
      this.isFormValid.valueChanges,
      this.titleField.valueChanges.pipe(startWith(this.titleField.value), map(() => this.titleField.valid))
    ).pipe(
      map(([formValid, titleValid]: [boolean, boolean]) => formValid && titleValid)
    );

    this.isActionable = combineLatest(
      this.canAction.valueChanges.pipe(startWith(this.canAction.value)),
      fieldValid$
    ).pipe(
      map(([actionable, valid]: [boolean, boolean]) => actionable ? valid : actionable)
    );
  }


  setFormValid(value: boolean) {
    this.isFormValid.setValue(value);
  }


  deleteAddress() {
    if (!this.canAction.value) {
      return;
    }

    this.canAction.setValue(false);

    this._addressService.deleteAddress(this.address.id).subscribe(
      (success) => {
        if (success) {
          const response: EditedActionResponse = {
            action: EditedAddressAction.DELETED,
            address: null
          };
          this._dialogRef.close(response);
          return;
        }
        this._snackbar.open(TextContent.DELETE_FAILED, 'warn');
      }
    );
  }


  setAddress() {
    if (!this.canAction.value) {
      return;
    }

    this.canAction.setValue(false);

    let action$: Observable<boolean>;

    if (this.address.id === 0) {
      action$ = this.saveAddress();
    } else {
      action$ = this.updateAddress();
    }

    action$.pipe(
      tap((success) => {
        if (!success) {
          this.canAction.setValue(true);
        }
      })
    ).subscribe();
  }


  private saveAddress(): Observable<boolean> {

    const newTitle = this.titleField.value;
    const createdValues = this.addressForm.getFormValues();
    const newAddress = JSON.parse(JSON.stringify(this.address));

    for (const key of Object.keys(createdValues)) {
      if (newAddress[key] !== createdValues[key]) {
        newAddress[key] = createdValues[key];
      }
    }

    newAddress.title = newTitle;

    return this._addressService.createOwnAddress(
      newAddress.title,
      newAddress.firstName,
      newAddress.lastName,
      newAddress.addressLine1,
      newAddress.addressLine2,
      newAddress.city,
      newAddress.state,
      newAddress.countryCode,
      newAddress.zipCode
    ).pipe(
      tap((myNewAddress) => {
        const response: EditedActionResponse = {
          action: EditedAddressAction.CREATED,
          address: myNewAddress
        };
        this._dialogRef.close(response);
      }),
      mapTo(true),
      catchError(() => {
        this._snackbar.open(TextContent.CREATE_FAILED, 'warn');
        return of(false);
      }),
    );
  }


  private updateAddress(): Observable<boolean> {

    const newTitle = this.titleField.value;
    const updatedValues = this.addressForm.getFormValues();
    const newAddress = JSON.parse(JSON.stringify(this.address));

    let isEdited = false;

    for (const key of Object.keys(updatedValues)) {
      if (newAddress[key] !== updatedValues[key]) {
        isEdited = true;
        newAddress[key] = updatedValues[key];
      }
    }

    if (newTitle !== newAddress.title) {
      isEdited = true;
      newAddress.title = newTitle;
    }

    if (!isEdited) {
      const response: EditedActionResponse = {
        action: EditedAddressAction.NO_CHANGE,
        address: this.address
      };
      this._dialogRef.close(response);
    }

    return this._addressService.updateOwnAddress(
      newAddress.id,
      newAddress.title,
      newAddress.firstName,
      newAddress.lastName,
      newAddress.addressLine1,
      newAddress.addressLine2,
      newAddress.city,
      newAddress.state,
      newAddress.countryCode,
      newAddress.zipCode
    ).pipe(
      map((result) => {
        const response: EditedActionResponse = {
          action: EditedAddressAction.UPDATED,
          address: result
        };
        this._dialogRef.close(response);
        return true;
      }),
      catchError(() => {
        this._snackbar.open(TextContent.UPDATE_FAILED, 'warn');
        return of(false);
      })
    );
  }
}
