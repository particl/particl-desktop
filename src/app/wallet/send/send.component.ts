import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Log } from 'ng2-logger';

import { SendService } from './send.service';
import { BalanceService } from '../balances/balance.service';
import { Subscription } from 'rxjs/Subscription';
import { RPCService } from '../../core/rpc/rpc.service';

import { AddressLookupComponent } from '../addresslookup/addresslookup.component';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent implements OnInit, OnDestroy {

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

  // TODO: Create proper Interface / type
  send: any = {
    fromType: 'public',
    toType: 'public',
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

  constructor(private sendService: SendService, private balanceService: BalanceService, private _rpc: RPCService) { }

  ngOnInit() {
    this._sub = this.balanceService.getBalances()
      .subscribe(
        balances => {
          this._balance = balances;
        },
        error => this.log.er('balanceService subscription error:' + error));
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  /*
    UI logic
  */

  sendTab(type: string) {
    this.type = type;
  }

  toggleAdvanced() {
    this.advanced = !this.advanced;
  }

  getBalance(account: string) {
    return (this._balance ? this._balance.getBalance(account.toUpperCase()) : '');
  }


  /** Amount validation functions. */
  checkAmount(): boolean {
    // hooking verifyAmount here, on change of type -> retrigger check of amount.
    this.verifyAmount();

    return this.send.validAmount;
  }

  verifyAmount() {

    if (this.send.amount === undefined || +this.send.amount === 0 || this.send.fromType === '') {
      this.send.validAmount = undefined;
      return;
    }

    if ((this.send.amount + '').indexOf('.') >= 0 && (this.send.amount + '').split('.')[1].length > 8) {
      this.send.validAmount = false;
      return;
    }

    if ((this.send.amount + '').indexOf('.') >= 0 && (this.send.amount + '').split('.')[1].length > 8) {
      this.send.validAmount = false;
      return;
    }


    if (this.send.amount <= this.getBalance(this.send.fromType)) {
      this.send.validAmount = true;
      return;
    } else {
      this.send.validAmount = false;
      return;
    }

  }

  /** checkAddres: returns boolean, so it can be private later. */
  checkAddress(): boolean {
    return this.send.validAddress;
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

    this._rpc.call(this, 'validateaddress', [this.send.toAddress], validateAddressCB);
  }


  /** Clear the send object. */
  clear() {
    this.send = {
      fromType: '',
      toType: '',
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


  /*
     Validation modal
  */

  openValidate() {
    document.getElementById('validate').classList.remove('hide');
  }

  closeValidate() {
    document.getElementById('validate').classList.add('hide');
  }

  /*
    Payment function
  */
  pay() {

    const input = this.send.fromType;
    let output = this.send.toType;
    const address = this.send.toAddress;
    const amount = this.send.amount;
    const comment = this.send.note;
    const narration = this.send.note;
    const substractfee = false;
    const ringsize = this.send.privacy;
    const numsigs = 1;

    const currency = this.send.currency;

    if (input === '' ) {
      alert('You need to select an input type (public, blind or anon)!');
      this.closeValidate();
      return;
    }
    if (this.type === 'balanceTransfer' && output === '') {
      alert('You need to select an output type (public, blind or anon)!');
      this.closeValidate();
      return;
    }

    if (this.type === 'balanceTransfer' && this.send.fromType === this.send.toType) {
      alert('You have selected "' + this.send.fromType + '"" twice!\n Balance transfers can only happen between two different types.');
      this.closeValidate();
      return;
    }

    if (this.type === 'sendPayment') {
      output = input;

      if (output === 'private' && address.length < 35) {
        alert('Stealth address required for private transactions!');
        this.closeValidate();
        return;
      }

      // edit label of address
      this.addLabelToAddress();

      // send transaction
      this.sendService.sendTransaction(input, output, address, amount, comment, substractfee, narration, ringsize, numsigs);

    } else if (this.type === 'balanceTransfer') {
      // perform balance transfer
      this.sendService.transferBalance(input, output, address, amount, ringsize, numsigs);
    }

    this.clear();
    this.closeValidate();
  }

  /*
    AddressLookup Modal + set details
  */

  openLookup() {
    this.addressLookup.show();
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

    if (isMine) {
      if (!confirm('Address is one of our own - change label? ')) {
        return;
      }
    }

    const label = this.send.toLabel;
    const addr = this.send.toAddress;

    this._rpc.call(this, 'manageaddressbook', ['newsend', addr, label],
      this.rpc_addLabel_success,
      this.rpc_addLabel_failed
    );
  }

  rpc_addLabel_success(json: Object) {
    this.log.er('rpc_addLabel_success: successfully added label to address.');
  }

  rpc_addLabel_failed(json: Object) {
    this.log.er('rpc_addLabel_failed: failed to add label to address.');
  }

}
