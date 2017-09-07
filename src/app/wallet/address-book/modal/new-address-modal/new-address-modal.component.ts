import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlashNotificationService } from '../../../../services/flash-notification.service';
import { RPCService } from '../../../../core/rpc/rpc.service';
import { MdDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-new-address-modal',
  templateUrl: './new-address-modal.component.html',
  styleUrls: ['./new-address-modal.component.scss']
})
export class NewAddressModalComponent implements OnInit {
  public addAddressBookForm: FormGroup;
  public address: string;
  public label: string;

  log: any = Log.create('address-book.component');

  /*
   Validation state
   */
  private validAddress: boolean = undefined;
  private isMine: boolean = undefined;

  constructor(public dialogRef: MdDialogRef<NewAddressModalComponent>,
              private formBuilder: FormBuilder,
              private _rpc: RPCService,
              private flashNotificationService: FlashNotificationService) {
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.addAddressBookForm = this.formBuilder.group({
      address: this.formBuilder.control(null, [Validators.required]),
      label: this.formBuilder.control(null, [Validators.required]),
    });
  }

  closeModal(): void {
    this.addAddressBookForm.reset();
    this.dialogRef.close();
  }


  /**
   * Returns if the entered address is valid or not AND if it is not ours (isMine).
   */
  checkAddress(): boolean {
    return this.validAddress && !this.isMine;
  }

  /*

   RPC Logic

   */


  /*
   Add address to addressbook
   */


  /**
   * Adds the address to the addressbook if address is valid & has label (in UI textbox) AND is not one of our own addresses.
   */
  onSubmitForm(): void {
    if (!this.validAddress) {
      this.flashNotificationService.open('Please enter a valid address!');
      return;
    }

    if (this.isMine) {
      this.flashNotificationService.open('This is your own address - can not be added to addressbook!');
      return;
    }

    if (this.label !== undefined) {
      this._rpc.call('manageaddressbook', ['newsend', this.address, this.label])
        .subscribe(response => {
            this.rpc_addAddressToBook_success(response)
          },
          error => {
          console.log('error', error);
            this.rpc_addAddressToBook_failed(error);
          });
    }
  }

  /**
   * Address was added succesfully to the address book.
   */
  rpc_addAddressToBook_success(json: Object): void {
    if (json['result'] === 'success') {
      this.closeModal();
      this.flashNotificationService.open('Address successfully added to the addressbook!');
      // TODO: remove specialPoll! (updates the address table)
      this._rpc.specialPoll();
    }
  }

  /**
   * Address was not added to the addressbook
   * e.g: wallet still locked
   */
  rpc_addAddressToBook_failed(json: Object): void {
    this.closeModal();
    this.log.er('rpc_addAddressToBook_failed');
    this.log.er(json);
    // TODO: remove specialPoll! (updates the address table)
    this._rpc.specialPoll();
  }

  /*
   Verify address
   */

  /**
   * Verify if address is valid through RPC call and set state to validAddress..
   */
  verifyAddress() {
    if (this.address === undefined || this.address === '') {
      this.validAddress = undefined;
      this.isMine = undefined;
      return;
    }

    this._rpc.call('validateaddress', [this.address])
      .subscribe(response => {
          this.rpc_verifyAddress_success(response)
        },
        error => {
          this.log.er('rpc_validateaddress_failed');
        });
    return;
  }

  /**
   * Callback of verifyAddress, sets state.
   */
  rpc_verifyAddress_success(json: Object): void {
    this.validAddress = json['isvalid'];
    this.isMine = json['ismine'];
    if (json['account'] !== undefined) {
      this.label = json['account'];
    }
  }


}
