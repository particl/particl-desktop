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

  public type: string = 'sign';
  public formData: SignVerifyMessage = new SignVerifyMessage();
  public validAddress: string;
  public addressForm: FormGroup;
  log: any = Log.create('SignatureAddressModalComponent');

  constructor(
    private dialog: MdDialog,
    private _rpc: RPCService,
    private flashNotification: FlashNotificationService,
    private formBuilder: FormBuilder,
    private _modals: ModalsService
  ) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.addressForm = this.formBuilder.group({
      address: this.formBuilder.control(null, [Validators.required]),
      signature: this.formBuilder.control({value: null, disabled: true}),
      message: this.formBuilder.control(null),
    });
  }

  selectTab(index: number): void {
    this.resetForm();
    this.type = (index) ? 'verify' : 'sign';
  }

  openLookup() {
    const dialogRef = this.dialog.open(AddressLookupComponent);
    // @TODO confirm lookup type wit ryno
    dialogRef.componentInstance.type = 'receive';
    dialogRef.componentInstance.selectAddressCallback.subscribe((response: AddressLookUpCopy) => {
      this.selectAddress(response);
      dialogRef.close();
    });
  }

  selectAddress(copyObject: AddressLookUpCopy) {
    this.formData.address = copyObject.address;
    // this.formData.address = copyObject.address;
    // this.verifyAddress();
  }

  // copy code start

  /** verifyAddress: calls RPC to validate it. */
  verifyAddress() {
    if (!this.formData.address) {
      // this.formData.validAddress = undefined;
      return;
    }

    const validateAddressCB = (response) => {
       this.validAddress = response.isvalid;

      if (!!response.account) {
        // this.formData.toLabel = response.account;
      }
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
    if (this.type = 'sign') {
      this._rpc.call('signmessage', [address, message])
        .subscribe(response => {
            this.formData.signature = response;
            this.flashNotification.open('signmessage message successfully');
          },
          error => this.log.er('signmessage failed', error));
    } else {
      this._rpc.call('verifymessage', [this.formData])
        .subscribe(response => {
            this.flashNotification.open('verifymessage message successfully');
          },
          error => this.log.er('verifymessage failed'));
    }
  }

  resetForm(): void {
    this.addressForm.reset();
  }

  onCopyAddress(): void {
    this.flashNotification.open('Address copy to clipboard');
  }
}
