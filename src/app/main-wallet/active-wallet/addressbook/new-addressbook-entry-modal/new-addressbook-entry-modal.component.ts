import { Component, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { iif, of } from 'rxjs';
import { finalize, concatMap } from 'rxjs/operators';
import { NotOwnAddressValidator } from './not-owned-address.directive';
import { AddressService } from '../../shared/address.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { AddressAdded } from '../../shared/address.models';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { AddressHelper } from 'app/core/util/utils';


enum TextContent {
  ADDRESS_ADDED = 'Address successfully added',
  ADDRESS_ADD_ERROR = 'An error occurred while adding the address'
}


function properAddressValidator(regex: RegExp): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    return regex.test(control.value) ? null : {properAddress: 'Invalid address provided'}
  };
}


@Component({
  selector: 'app-new-address-modal',
  templateUrl: './new-addressbook-entry-modal.component.html',
  styleUrls: ['./new-addressbook-entry-modal.component.scss']
})
export class NewAddressbookEntryModalComponent implements OnInit {

  @ViewChild('addressInput', {static: true}) addressInput: ElementRef;
  @Output() isAdded: EventEmitter<boolean> = new EventEmitter();

  addAddressForm: FormGroup;
  isProcessing: boolean = false;


  constructor(
    private dialogRef: MatDialogRef<NewAddressbookEntryModalComponent>,
    private _addressValidator: NotOwnAddressValidator,
    private _addressService: AddressService,
    private _unlocker: WalletEncryptionService,
    private _snackbar: SnackbarService
  ) {
    this.addAddressForm = new FormGroup({
      address: new FormControl('', {
        validators: [Validators.required, properAddressValidator((new AddressHelper()).addressBothRegex)],
        asyncValidators: [this._addressValidator.validate.bind(this._addressValidator)],
        updateOn: 'blur'
      }),
      label: new FormControl('', [Validators.required])
    });
  }


  ngOnInit() {
    this.addressInput.nativeElement.focus();
  }

  get address(): AbstractControl {
    return this.addAddressForm.get('address');
  }

  get label(): AbstractControl {
    return this.addAddressForm.get('label');
  }


  closeModal(): void {
    this.dialogRef.close();
  }


  addAddressbookEntry() {
    if (this.isProcessing) {
      return;
    }
    if (!this.addAddressForm.valid) {
      // Necessary because the paste button for the address can trigger
      //    a form submission if the pasted content includes tabs/newlines for example.
      return;
    }
    this.isProcessing = true;
    this._unlocker.unlock().pipe(
      concatMap((unlocked: boolean) => iif(
        () => unlocked,
        this._addressService.saveAddressToAddressBook(this.address.value, this.label.value),
        of(null)
      )),
      finalize(() => this.isProcessing = false)
    ).subscribe(
      (result: AddressAdded | null) => {
        if (result !== null) {
          if (result.result === 'success') {
            this._snackbar.open(TextContent.ADDRESS_ADDED, '');
            this.isAdded.emit(true);
            this.dialogRef.close();
          } else {
            this._snackbar.open(TextContent.ADDRESS_ADD_ERROR, 'err');
          }
        }
      },
      (err) => this._snackbar.open(TextContent.ADDRESS_ADD_ERROR, 'err')
    );
  }


  onAddressPasted(ev: any) {
    ev.preventDefault();
    // strips whitespace out of the pasted-in text
    const str = String(ev.clipboardData.getData('text') || '').replace(/\s+/gm, '').trim();
    setTimeout(() => {
      this.address.setValue(str);
    }, 1);
  }


  pasteAddress(event: any) {
    this.addressInput.nativeElement.focus();
    document.execCommand('paste');
  }

}
