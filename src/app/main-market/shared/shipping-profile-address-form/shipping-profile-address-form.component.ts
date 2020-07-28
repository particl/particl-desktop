import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { ShippingAddress } from './shipping-profile-address.models';
import { isBasicObjectType } from '../utils';
import { RegionListService } from 'app/main-market/services/region-list/region-list.service';
import { TreeSelectComponent } from '../tree-select/tree-select.component';


@Component({
  selector: 'market-shipping-address-form',
  templateUrl: './shipping-profile-address-form.component.html',
  styleUrls: ['./shipping-profile-address-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShippingProfileAddressFormComponent implements OnInit, OnDestroy {


  @Input() srcAddress: ShippingAddress = null;
  @Input() isEditable: boolean = true;
  @Output() isValid: EventEmitter<boolean> = new EventEmitter();
  @Output() regionChange: EventEmitter<string> = new EventEmitter();

  addressForm: FormGroup;

  readonly regionList$: Observable<{id: string, name: string}[]>;
  readonly MAX_FIELD_LENGTH: number = 100;

  private destroy$: Subject<void> = new Subject();
  @ViewChild(TreeSelectComponent, {static: false}) private countrySelector: TreeSelectComponent;


  constructor(
    private _regionService: RegionListService,
    private _cdr: ChangeDetectorRef
  ) {

    const regions = this._regionService.getCountryList().map(c => ({id: c.iso, name: c.name}));
    this.regionList$ = of(regions);

    this.addressForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      addressLine1: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      addressLine2: new FormControl('', [Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      city: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      state: new FormControl('', [Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      zipCode: new FormControl('', [Validators.maxLength(this.MAX_FIELD_LENGTH)]),
      countryCode: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_FIELD_LENGTH)])
    });
  }


  ngOnInit() {

    this.setAddressFormDetails(this.srcAddress);

    if (!this.isEditable) {
      this.addressForm.disable();
    }

    this.addressForm.statusChanges.pipe(
      // NB! emitted on every keystroke it seems, which fits the current requirements, but might have potential issues in the future
      tap(() => {
        this.isValid.emit(this.addressForm.valid);

      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.addressForm.get('countryCode').valueChanges.pipe(
      tap(value => this.regionChange.emit(value)),
      takeUntil(this.destroy$)
    ).subscribe();

    // emit initial validity
    this.isValid.emit(this.addressForm.valid);

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getFormValues(): {[key: string]: string} {
    const controls = Object.keys(this.addressForm.controls);
    const values: {[key: string]: string} = {};
    controls.forEach(control => {
      values[control] = this.addressForm.controls[control].value;
      if (typeof values[control] === 'string') {
        values[control] = values[control].trim();
      }
    });
    return values;
  }


  resetAddressForm(address: ShippingAddress) {
    this.setAddressFormDetails(address);
    this.countrySelector.resetSelection(this.addressForm.get('countryCode').value);
    this._cdr.detectChanges();
    // emit validity on changing of the form
    this.isValid.emit(this.addressForm.valid);
  }


  private setAddressFormDetails(address: ShippingAddress) {
    const shippingAddress = {
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      countryCode: '',
      state: '',
      zipCode: ''
    };

    const srcKeys = Object.keys(shippingAddress);

    for (const key of srcKeys) {
      this.addressForm.get(key).setValue(shippingAddress[key]);
    }

    if (isBasicObjectType(address)) {
      for (const key of srcKeys) {
        if ((key in address) && (typeof shippingAddress[key] === typeof address[key])) {
          this.addressForm.get(key).setValue(address[key]);
        }
      }
    }
  }

}
