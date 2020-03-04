import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { of, iif } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { AddressService } from '../address.service';
import { FilteredAddress } from '../address.models';


enum TextContent {
  ACTION_BUTTON_TEXT_SIGN = 'Sign message',
  ACTION_BUTTON_TEXT_VERIFY = 'Verify message',
  PLACEHOLDER_SIGNATURE_SIGN = 'Click [Sign Message] to generate signature',
  PLACEHOLDER_SIGNATURE_VERIFY = 'Signature',
  ACTION_SIGN_SUCCESS = 'Message signed successfully',
  ACTION_SIGN_FAIL = 'Failed to sign message, please try again',
  ACTION_VERIFY_SUCCESS = 'Message verified!',
  ACTION_VERIFY_FAIL = 'Message verification failed:\nthe supplied signature and/or message were invalid for this address!',
  ACTION_GENERIC_FAIL = 'The request failed to be completed, please try again'
};


type ModalType = 'sign' | 'verify';


interface SignVerifyAddressTemplateInputs {
  address: FilteredAddress,
  type: ModalType
};


@Component({
  templateUrl: './sign-verify-address-modal.component.html',
  styleUrls: ['./sign-verify-address-modal.component.scss']
})
export class SignVerifyAddressModalComponent implements OnInit {

  @ViewChild('messageInput', {static: true}) messageInput: ElementRef;

  isProcessing: boolean = false;

  readonly addressForm: FormGroup;
  readonly actionButtonText: string;
  readonly signMessagePlaceholder: string;
  readonly isSigning: boolean;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SignVerifyAddressTemplateInputs,
    private _snackbar: SnackbarService,
    private _unlocker: WalletEncryptionService,
    private _addressService: AddressService
  ) {

    this.isSigning = this.data.type === 'sign';

    this.addressForm = new FormGroup({
      address: new FormControl({value: `${this.data.address.address}`, disabled: true}, [Validators.required]),
      message: new FormControl('', [Validators.required]),
      signature: new FormControl({value: '', disabled: this.isSigning}, this.isSigning ? [] : [Validators.required])
    });

    this.signMessagePlaceholder = this.isSigning ? TextContent.PLACEHOLDER_SIGNATURE_SIGN : TextContent.PLACEHOLDER_SIGNATURE_VERIFY;
    this.actionButtonText = this.isSigning ? TextContent.ACTION_BUTTON_TEXT_SIGN : TextContent.ACTION_BUTTON_TEXT_VERIFY;
  }


  ngOnInit() {
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 1)
  }


  get address(): AbstractControl {
    return this.addressForm.get('address');
  }

  get message(): AbstractControl {
    return this.addressForm.get('message');
  }

  get signature(): AbstractControl {
    return this.addressForm.get('signature');
  }


  copyToClipBoard(): void {
    this._snackbar.open('Signature copied to clipboard.');
  }


  resetForm(): void {
    this.message.setValue('');
    this.signature.setValue('');
    // if (!this.isSigning) {
    //   this.signature.setValue('');
    // }
  }


  onFormSubmit() {
    if (this.isProcessing || !this.addressForm.valid) {
      return;
    }

    this.isProcessing = true;

    this._unlocker.unlock({timeout: 5}).pipe(
      concatMap((unlocked: boolean) => iif(
        () => unlocked,
        iif(
          () => this.isSigning,
          this._addressService.signAddressMessage(this.address.value, this.message.value),
          this._addressService.verifySignedAddressMessage(this.address.value, this.signature.value, this.message.value)
        ),
        of(null)
      )),
      finalize(() => this.isProcessing = false)
    ).subscribe(
      (response: string | boolean) => {
        if (response === null) {
          // user did not complete the unlocking modal
          return;
        }

        if (this.isSigning) {
          this.signature.setValue((<string>response));
          this._snackbar.open(TextContent.ACTION_SIGN_SUCCESS);
        } else {
          const msg = (<boolean>response) ? TextContent.ACTION_VERIFY_SUCCESS : TextContent.ACTION_VERIFY_FAIL;
          this._snackbar.open(msg, response ? '' : 'err');
        }
      },
      (err) => {
        const msg = this.isSigning ? TextContent.ACTION_SIGN_FAIL : TextContent.ACTION_GENERIC_FAIL;
        this._snackbar.open(msg, 'err');
      }
    );
  }
}
