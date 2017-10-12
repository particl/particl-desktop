import { Component, ViewChild } from '@angular/core';

import { Log } from 'ng2-logger';

import { SendService } from './send.service';
import { Subscription } from 'rxjs/Subscription';
import { RPCService } from '../../core/rpc/rpc.module';
import { ModalsService } from '../../modals/modals.service';

import { AddressLookupComponent } from '../addresslookup/addresslookup.component';

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
  @ViewChild('addressLookup')
  public addressLookup: AddressLookupComponent;

  type: string = 'sendPayment';
  advanced: boolean = false;
  advancedText: string = 'Show Recipient Address'
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
    privacy: 50
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
    private _modals: ModalsService
  ) {
  }

  /** Select tab */
  selectTab(type: string) {
    this.type = type;
    this.send.input = 'balance';
    if (this.type === 'balanceTransfer') {
      this.send.toAddress = '';
      this.verifyAddress();
    }
  }

  /** Toggle advanced controls and settings */
  toggleAdvanced() {
    if (this.advanced) {
      this.advancedText = 'Show Recipient Address';
    } else {
      this.advancedText = 'Hide Recipient Address';
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
    }

    this._rpc.call('validateaddress', [this.send.toAddress])
      .subscribe(response => {
        validateAddressCB(response)
      },
      error => {
        this.log.er('verifyAddress: validateAddressCB failed');
      });
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

  /** Validation modal */
  openValidate() {
    document.getElementById('validate').classList.remove('hide');
  }

  closeValidate() {
    document.getElementById('validate').classList.add('hide');
  }

  /** Payment function */
  pay() {
    this.closeValidate();

    if (this.send.input === '' ) {
      alert('You need to select an input type (public, blind or anon)!');
      return;
    }

    // Send normal transaction - validation
    if (this.type === 'sendPayment') {

      // pub->pub, blind->blind, priv-> priv
      this.send.output = this.send.input;

      // Check if stealth address if output is private
      if (this.send.output === 'anon_balance' && this.send.toAddress.length < 35) {
        alert('Stealth address required for private transactions!');
        return;
      }

    // Balance transfer - validation
    } else if (this.type === 'balanceTransfer') {

      if (this.send.output === '') {
        alert('You need to select an output type (public, blind or anon)!');
        return;
      }

      if (this.send.input === this.send.output) {
        alert('You have selected "' + this.send.input + '"" twice!\n Balance transfers can only happen between two different types.');
        return;
      }

    }

    if (['Locked', 'Unlocked, staking only'].indexOf(this._rpc.state.get('encryptionstatus')) !== -1) {
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

  // AddressLookup Modal + set details
  openLookup(type: string) {
    this.addressLookup.show(type);
  }

  /** Select an address, set the appropriate models
    * @param address The address to send to
    * @param label The label for the address.
    */
  selectAddress(address: string, label: string) {
    this.send.toAddress = address;
    this.send.toLabel = label;
    this.addressLookup.hide();
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

}
