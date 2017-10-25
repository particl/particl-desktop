import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlashNotificationService } from '../../../../services/flash-notification.service';
import { RPCService } from '../../../../core/rpc/rpc.service';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';
import { ModalsService } from '../../../../modals/modals.service';
import { ModalsComponent } from '../../../../modals/modals.component';

@Component({
  selector: 'app-new-address-modal',
  templateUrl: './new-address-modal.component.html',
  styleUrls: ['./new-address-modal.component.scss']
})
export class NewAddressModalComponent implements OnInit {
  public addAddressBookForm: FormGroup;
  public address: string;
  public label: string;
  public isEdit: boolean;
  public modalTitle: string;

  log: any = Log.create('app-new-address-modal');

  /*
   Validation state
   */
  public validAddress: boolean = undefined;
  public isMine: boolean = undefined;

  constructor(public dialogRef: MdDialogRef<NewAddressModalComponent>,
              private formBuilder: FormBuilder,
              private _rpc: RPCService,
              private flashNotificationService: FlashNotificationService,
              private _modals: ModalsService,
              private dialog: MdDialog) {
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.verifyAddress();
      this.modalTitle = 'Edit address';
    } else {
      this.modalTitle = 'Add new address to addresbook';
    }
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

    if (this.label !== undefined && this.label.trim() && !this.isMine) {
      if (this._rpc.state.get('locked')) {
        // unlock wallet and send transaction
        this._modals.open('unlock', {
          forceOpen: true, timeout: 3, callback: this.addressCallBack.bind(this)
        });
      } else {
        // wallet already unlocked
        this.addressCallBack();
      }
      this.dialogRef.close();
    }
  }

  private addressCallBack() {
    this._rpc.call('manageaddressbook', ['newsend', this.address, this.label])
      .subscribe(
        response => this.rpc_addAddressToBook_success(response),
        error => this.rpc_addAddressToBook_failed(error));
  }

  /**
   * Address was added succesfully to the address book.
   */
  rpc_addAddressToBook_success(json: Object): void {
    if (json['result'] === 'success') {
      this.closeModal();
      const mesage: string = (this.isEdit) ? 'Address successfully updated to the addressbook!'
        : 'Address successfully added to the addressbook!';

      this.flashNotificationService.open(mesage);
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
