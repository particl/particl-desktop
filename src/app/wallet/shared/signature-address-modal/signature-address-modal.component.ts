import { Component, OnInit } from '@angular/core';
import { AddressLookUpCopy } from '../../models/address-look-up-copy';
import { AddressLookupComponent } from '../../addresslookup/addresslookup.component';
import { MdDialog } from '@angular/material';
import { RPCService } from '../../../core/rpc/rpc.service';
import { Log } from 'ng2-logger';
import { SignVerifyMessage } from '../../models/sign-verify-message';
import { FlashNotificationService } from '../../../services/flash-notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalsService } from '../../../modals/modals.service';

@Component({
  selector: 'app-signature-address-modal',
  templateUrl: './signature-address-modal.component.html',
  styleUrls: ['./signature-address-modal.component.scss']
})
export class SignatureAddressModalComponent implements OnInit {

  public type: string;
  public formData: SignVerifyMessage = new SignVerifyMessage();
  public validAddress: boolean;
  public addressForm: FormGroup;
  public isDisbaled: boolean = true;
  public isAddressLookup: boolean = false;
  public tabIndex: number = 1;

  log: any = Log.create('SignatureAddressModalComponent.component');

  constructor(
    private dialog: MdDialog,
    private _rpc: RPCService,
    private flashNotification: FlashNotificationService,
    private formBuilder: FormBuilder,
    private _modals: ModalsService
  ) {
  }

  ngOnInit() {
    if (this.type === 'verify') {
      this.tabIndex = 1;
      this.isDisbaled = false;
    } else {
      this.tabIndex = 0;
      this.type = 'sign';
    }
    this.buildForm();
  }

  buildForm(): void {
    this.addressForm = this.formBuilder.group({
      address: this.formBuilder.control(null, [Validators.required]),
      signature: this.formBuilder.control({value: null, disabled: this.isDisbaled}, [Validators.required]),
      message: this.formBuilder.control(null),
    });
  }

  selectTab(index: number): void {
    this.type = (index) ? 'verify' : 'sign';
    this.isDisbaled = (this.type !== 'verify');
    this.buildForm();
  }

  openLookup() {
    const dialogRef = this.dialog.open(AddressLookupComponent);
    // @TODO confirm lookup type
    dialogRef.componentInstance.type = 'receive';
    dialogRef.componentInstance.selectAddressCallback.subscribe((response: AddressLookUpCopy) => {
      this.selectAddress(response);
      dialogRef.close();
    });
  }

  selectAddress(copyObject: AddressLookUpCopy) {
    this.formData.address = copyObject.address;
    this.verifyAddress();
  }

  // copy code start

  /** verifyAddress: calls RPC to validate it. */
  verifyAddress() {
    if (!this.formData.address) {
      this.validAddress = undefined;
      return;
    }

    const validateAddressCB = (response) => {
       this.validAddress = response.isvalid;
    };

    this._rpc.call('validateaddress', [this.formData.address])
      .subscribe(
        response => validateAddressCB(response),
        error => this.log.er('verifyAddress: validateAddressCB failed'));
  }
  // copy code end

  onFormSubmit(): void {
    if (this._rpc.state.get('locked')) {
      // unlock wallet
      this._modals.open('unlock', {forceOpen: true, timeout: 3, callback: this.signVerifyMessage.bind(this)});
    } else {
      // wallet already unlocked
      this.signVerifyMessage();
    }
  }

  signVerifyMessage(): void {
    const address: string = this.formData.address;
    const message: string = (this.formData.message) ? this.formData.message : '';
    const signature: string = this.formData.signature;
    if (this.type === 'sign') {
      this._rpc.call('signmessage', [address, message])
        .subscribe(response => {
            this.formData.signature = response;
            this.flashNotification.open('Message Sign Successfully');
          },
          error => {
          // @TODO add generic message
            this.flashNotification.open(error.message);
            this.log.er('Sign Message Failed', error.message);
          });
    } else {
      this._rpc.call('verifymessage', [address, signature, message])
        .subscribe(response => {
            console.log(response);
            if(response.result) {
              //this.log.d(`message verification response value = ${response}`);
              this.flashNotification.open('Message verified.');
            } else {
              this.flashNotification.open('Message verification failed:\n the supplied signature and/or message were invalid for this address!');
            }
          },
          error => {
            // @TODO add generic message
            this.flashNotification.open(error.message);
            this.log.er('Verify Message Failed', error.message);
          });
    }
  }

  resetForm(): void {
    this.addressForm.reset();
  }

  onCopyAddress(): void {
    this.flashNotification.open('Copied address to clipboard!');
  }

  pasteAddress(): void {
    document.getElementById('signVerifyAdd').focus();
    document.execCommand('paste');
  }
}
