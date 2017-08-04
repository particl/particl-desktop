import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { SendService } from './send.service';
import { BalanceService } from '../balances/balance.service';
import { Subscription } from 'rxjs/Subscription';
import { RPCService } from '../../core/rpc/rpc.service';
import { ModalsService } from '../../modals/modals.service';

import { AddressLookupComponent } from '../addresslookup/addresslookup.component';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent implements OnInit, OnDestroy {
  private _sub: Subscription;
  private _balance: any;

  @ViewChild('addressLookup')
  public addressLookup: AddressLookupComponent;

  type: string = 'sendPayment';
  advanced: boolean = false;

  // TODO: Create proper Interface / type
  send: any = {
    fromType: 'public',
    toType: 'public',
    toAddress: '',
    validAddress: undefined,
    validAmount: undefined,
    currency: 'part',
    privacy: 50
  };

  lookup: string;

  constructor(
    private sendService: SendService,
    private balanceService: BalanceService,
    private _rpc: RPCService,
    private _modals: ModalsService
  ) {
  }

  callback_walletUnlocked(t: boolean) {
    console.log(t);
  }

  ngOnInit() {
    this._sub = this.balanceService.getBalances()
      .subscribe(
        balances => {
          this._balance = balances;
        },
        error => console.log('balanceService subscription error:' + error));
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

  getAddress(): string {
    if (this.type === 'sendPayment') {
      return this.send.toAddress;
    } else {
      return this.sendService.getBalanceTransferAddress();
    }
  }

  /*
    Amount validation functions
  */

  checkAmount(): boolean {
    // hooking verifyAmount here, on change of type -> retrigger check of amount.
    this.verifyAmount();

    return this.send['validAmount'];
  }

  verifyAmount() {

    if (this.send['amount'] === undefined || +this.send['amount'] === 0 || this.send['fromType'] === '') {
      this.send.validAmount = undefined;
      return;
    }

    if ((this.send.amount + '').indexOf('.') >= 0 && (this.send.amount + '').split('.')[1].length > 8) {
      this.send.validAmount = false;
      return;
    }

    if ((this.send['amount'] + '').indexOf('.') >= 0 && (this.send['amount'] + '').split('.')[1].length > 8) {
      this.send.validAmount = false;
      return;
    }


    if (this.send['amount'] <= this.getBalance(this.send['fromType'])) {
      this.send.validAmount = true;
      return;
    } else {
      this.send.validAmount = false;
      return;
    }

  }

  /*
    Address validation functions
      checkAddres: returns boolean, so it can be private later.
      verifyAddress: calls RPC to validate it
  */

  checkAddress(): boolean {
    return this.send['validAddress'];
  }

  verifyAddress() {
    if (this.send.toAddress === '' || this.send.toAddress === undefined) {
      this.send.validAddress = undefined;
      return;
    }

    this._rpc.call(this, 'validateaddress', [this.send.toAddress], this.rpc_callbackVerifyAddress);
    return;
  }

  rpc_callbackVerifyAddress(json: Object) {
    this.send.validAddress = json['isvalid'];
  }


  /*
    Clear the send object
  */
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


  /*
     Validation modal + payment function!
  */

  openValidate() {
    document.getElementById('validate').classList.remove('hide');
  }

  closeValidate() {
    document.getElementById('validate').classList.add('hide');
  }

  pay() {

    this.closeValidate();

    // TODO: Why are we making a copy of all the properties?
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
      return;
    }
    if (this.type === 'balanceTransfer' && output === '') {
      alert('You need to select an output type (public, blind or anon)!');
      return;
    }

    if (this.type === 'balanceTransfer' && this.send.fromType === this.send.toType) {
      alert('You have selected "' + this.send.fromType + '"" twice!\n Balance transfers can only happen between two different types.');
      return;
    }

    if (this.type === 'sendPayment') {
      output = input;

      if (output === 'private' && address.length < 35) {
        alert('Stealth address required for private transactions!');
        return;
      }

      // unlock wallet and send transaction
      this._modals.unlockWallet(this,
        this.sendTransaction,
        2);

    } else if (this.type === 'balanceTransfer') {

      // unlock wallet and transfer balance
      this._modals.unlockWallet(this,
        this.transferBalance,
        2);

    }
  }



  sendTransaction(): void {

    const input = this.send.fromType;
    const output = this.send.toType;
    const address = this.send.toAddress;
    const amount = this.send.amount;
    const comment = this.send.note;
    const narration = this.send.note;
    const substractfee = false;
    const ringsize = this.send.privacy;
    const numsigs = 1;

    this.sendService.sendTransaction(input, output, address, amount, comment, substractfee, narration, ringsize, numsigs);

    this.clear();
  }

  transferBalance(): void {

    const input = this.send.fromType;
    const output = this.send.toType;
    const address = this.send.toAddress;
    const amount = this.send.amount;
    const ringsize = this.send.privacy;
    const numsigs = 1;

    this.sendService.transferBalance(input, output, address, amount, ringsize, numsigs);

    this.clear();
  }

  /*
    AddressLookup Modal + set details
  */

  openLookup() {
    this.addressLookup.show();
  }

  selectAddress(address: string, label: string) {
    this.send.toAddress = address;
    this.send.toLabel = label;
    this.addressLookup.hide();
  }

}
