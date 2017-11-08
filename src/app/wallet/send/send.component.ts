import { Component, ElementRef, ViewChild } from '@angular/core';

import { Log } from 'ng2-logger';

import { SendService } from './send.service';
import { Subscription } from 'rxjs/Subscription';
import { RPCService } from '../../core/rpc/rpc.module';
import { ModalsService } from '../../modals/modals.service';

import { AddressLookupComponent } from '../addresslookup/addresslookup.component';
import { MdDialog } from '@angular/material';
import { AddressLookUpCopy } from '../models/address-look-up-copy';
import { SendConfirmationModalComponent } from './send-confirmation-modal/send-confirmation-modal.component';
import { FlashNotificationService } from '../../services/flash-notification.service';
import { ModalsComponent } from '../../modals/modals.component';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent {


  /*
    General
  */
  log: any = Log.create('send.component');

  /*
    UI logic
  */
  @ViewChild('address') address: ElementRef;
  type: string = 'sendPayment';
  advanced: boolean = false;
  progress: number = 10;
  advancedText: string = 'Show Advanced options'
  // TODO: Create proper Interface / type
  send: any = {
    input: 'balance',
    output: 'blind_balance',
    toAddress: '',
    toLabel: '',
    validAddress: undefined,
    validAmount: undefined,
    isMine: undefined,
    currency: 'part',
    privacy: 8
  };

  /*
    RPC logic
  */
  lookup: string;
  private _sub: Subscription;
  private _balance: any;

  constructor(
    private sendService: SendService,
    private _rpc: RPCService,
    private _modals: ModalsService,
    private dialog: MdDialog,
    private flashNotification: FlashNotificationService
  ) {
    this.progress = 50;
  }

  /** Select tab */
  selectTab(tabIndex: number) {
    this.type = (tabIndex) ? 'balanceTransfer' : 'sendPayment';
    this.send.input = 'balance';
    if (this.type === 'balanceTransfer') {
      this.send.toAddress = '';
      this.verifyAddress();
    }
  }

  /** Toggle advanced controls and settings */
  toggleAdvanced() {
    if (this.advanced) {
      this.advancedText = 'Show Advanced options';
    } else {
      this.advancedText = 'Hide Advanced options';
    }
    this.advanced = !this.advanced;
  }

  /** Get current account balance (Public / Blind / Anon) */
  getBalance(account: string) {
    return this._rpc.state.get(account) || 0;
  }

  /** Get the send address */
  getAddress(): string {
    if (this.type === 'sendPayment') {
      return this.send.toAddress;
    } else {
      return this.sendService.getBalanceTransferAddress();
    }
  }

  /** Amount validation functions. */
  checkAmount(): boolean {
    // hooking verifyAmount here, on change of type -> retrigger check of amount.
    this.verifyAmount();

    return this.send.validAmount;
  }

  verifyAmount() {

    if (this.send.amount === undefined || +this.send.amount === 0 || this.send.input === '' || this.send.amount === null) {
      this.send.validAmount = undefined;
      return;
    }

    if ((this.send.amount + '').indexOf('.') >= 0 && (this.send.amount + '').split('.')[1].length > 8) {
      this.send.validAmount = false;
      return;
    }
    // is amount in range of 0...CurrentBalance
    this.send.validAmount = (this.send.amount <= this.getBalance(this.send.input)
                            && this.send.amount > 0);
  }

  /** checkAddres: returns boolean, so it can be private later. */
  checkAddress(): boolean {
    // use default transferBalance address or custom address.
    return (this.type === 'balanceTransfer' && !this.send.toAddress) || this.send.validAddress;
  }

  /** verifyAddress: calls RPC to validate it. */
  verifyAddress() {
    if (!this.send.toAddress) {
      this.send.validAddress = undefined;
      this.send.isMine = undefined;
      return;
    }

    const validateAddressCB = (response) => {
      this.send.validAddress = response.isvalid;

      if (!!response.account) {
        this.send.toLabel = response.account;
      }

      if (!!response.ismine) {
        this.send.isMine = response.ismine;
      }
    };

    this._rpc.call('validateaddress', [this.send.toAddress])
      .subscribe(
        response => validateAddressCB(response),
        error => this.log.er('verifyAddress: validateAddressCB failed'));
  }

  /** Clear the send object. */
  clear() {
    this.send = {
      input: this.send.input,
      output: this.send.output,
      validAddress: undefined,
      validAmount: undefined,
      currency: 'part',
      privacy: 50
    };
  }

  clearReceiver() {
    this.send.toLabel = '';
    this.send.toAddress = '';
    this.send.validAddress = undefined;
  }

  onSubmit(): void {
    const dialogRef = this.dialog.open(SendConfirmationModalComponent);
    dialogRef.componentInstance.dialogContent = `Do you really want to send
      ${this.send.amount} ${this.send.currency.toUpperCase()} to ${this.getAddress()} ?`;

    dialogRef.componentInstance.onConfirm.subscribe(() => {
      dialogRef.close();
      this.pay();
    })
  }

  /** Payment function */
  pay() {
    if (this.send.input === '' ) {
      this.flashNotification.open('You need to select an input type (public, blind or anon)!');
      return;
    }

    // Send normal transaction - validation
    if (this.type === 'sendPayment') {

      // pub->pub, blind->blind, priv-> priv
      this.send.output = this.send.input;

      // Check if stealth address if output is private
      if (this.send.output === 'private' && this.send.toAddress.length < 35) {
        this.flashNotification.open('Stealth address required for private transactions!');
        return;
      }

    // Balance transfer - validation
    } else if (this.type === 'balanceTransfer') {

      if (this.send.output === '') {
        this.flashNotification.open('You need to select an output type (public, blind or anon)!');
        return;
      }

      if (this.send.input === this.send.output) {
        this.flashNotification.open(`You have selected ${this.send.input}
          twice!\n Balance transfers can only happen between two different types.`);

        return;
      }

    }

    if (this._rpc.state.get('locked')) {
      // unlock wallet and send transaction
      this._modals.open('unlock', {forceOpen: true, timeout: 3, callback: this.sendTransaction.bind(this)});
    } else {
      // wallet already unlocked
      this.sendTransaction();
    }
  }

  private sendTransaction(): void {
    if (this.type === 'sendPayment') {
      // edit label of address
      this.addLabelToAddress();

      this.sendService.sendTransaction(
        this.send.input, this.send.output, this.send.toAddress,
        this.send.amount, this.send.note, this.send.note,
        this.send.privacy, 1);
    } else {

      this.sendService.transferBalance(
        this.send.input, this.send.output, this.send.toAddress,
        this.send.amount, this.send.privacy, 1);
    }
    this.clear();
  }
  /*
    AddressLookup Modal + set details
  */

  openLookup() {
    const dialogRef = this.dialog.open(AddressLookupComponent);
    dialogRef.componentInstance.type = (this.type === 'balanceTransfer') ? 'receive' : 'send';
    dialogRef.componentInstance.selectAddressCallback.subscribe((response: AddressLookUpCopy) => {
      this.selectAddress(response);
      dialogRef.close();
    });
  }

  /** Select an address, set the appropriate models
    * @param address The address to send to
    * @param label The label for the address.
    */
  selectAddress(copyObject: AddressLookUpCopy) {
    this.send.toAddress = copyObject.address;
    this.send.toLabel = copyObject.label;
    // this.addressLookup.hide();
    this.verifyAddress();
  }

  /** Add/edits label of an address. */
  addLabelToAddress() {
    const isMine = this.send.isMine;

    /*
    if (isMine) {
      if (!confirm('Address is one of our own - change label? ')) {
        return;
      }
    }*/

    const label = this.send.toLabel;
    const addr = this.send.toAddress;

    this._rpc.call('manageaddressbook', ['newsend', addr, label])
      .subscribe(
        response => this.log.er('rpc_addLabel_success: successfully added label to address.'),
        error => this.log.er('rpc_addLabel_failed: failed to add label to address.'))
  }

  setPrivacy(level: number, prog: number) {
    this.send.privacy = level;
    this.progress = prog;
  }

  pasteAddress() {
    // document.getElementById('address').focus();
    this.address.nativeElement.focus();
    document.execCommand('Paste');
  }

}
