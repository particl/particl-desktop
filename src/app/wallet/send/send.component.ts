import { Component, OnInit, OnDestroy } from '@angular/core';
import { SendService } from './send.service';
import { BalanceService } from '../balances/balance.service';
import { Subscription } from 'rxjs/Subscription';
import { RPCService } from '../../core/rpc/rpc.service';
@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent implements OnInit, OnDestroy {
  private _sub: Subscription;
  private _balance: any;

  type: string = 'sendPayment';
  advanced: boolean = false;
  send: Object = {
    fromType: '',
    toType: '',
    validAddress: undefined,
    currency: 'part',
    privacy: 50
  };

  constructor(private SendService: SendService, private balanceService: BalanceService, private _rpc: RPCService) { }

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

  sendTab(type: string) {
    this.type = type;
  }

  toggleAdvanced() {
    this.advanced = !this.advanced;
  }

  getBalance(account: string) {
    if (account === 'public') {
      return ( this._balance !== undefined ? this._balance.getBalance('PUBLIC') : '');
    }
    if (account === 'blind') {
      return ( this._balance !== undefined ? this._balance.getBalance('BLIND') : '');
    }
    if (account === 'private') {
      return ( this._balance !== undefined ? this._balance.getBalance('PRIVATE') : '');
    }
  }

  checkAddress(): boolean {
    return this.send['validAddress'];
  }

  verifyAmount(): boolean {
    if (this.send['amount'] === undefined || this.send['amount'] === 0 || this.send['fromType'] === '') {
      return undefined;
    }

    if ((this.send['amount'] + '').indexOf('.') >= 0 && (this.send['amount'] + '').split('.')[1].length > 8) {
      return false;
    }


    if (this.send['amount'] <= this.getBalance(this.send['fromType'])) {
      return true;
    }

    return false;
  }

  verifyAddress() {
    if (this.send['toAddress'] === undefined || this.send['toAddress'] === '') {
      this.send['validAddress'] = undefined;
      return;
    }

    const ret = false;
    if ((this.send['toAddress'].indexOf('p') === 0) === false) {
      if ((this.send['toAddress'].indexOf('T') === 0) === false) {
        this.send['validAddress'] = false;
        return;
      } else if (this.send['toAddress'].length > 102) { // starts with T but over 102 chars
        this.send['validAddress'] = false;
        return;
      }
    } else if (this.send['toAddress'].length > 34) { // starts with p but over 34 chars
      this.send['validAddress'] = false;
      return;
    }

    if (this.send['toAddress'].length === 34 && this.send['toAddress'].indexOf('p') === 0) {
      this._rpc.call(this, 'validateaddress', [this.send['toAddress']], this.rpc_callbackVerifyAddress);
    }

    if (this.send['toAddress'].length === 102 && this.send['toAddress'].indexOf('Tet') === 0) {
      this._rpc.call(this, 'validateaddress', [this.send['toAddress']], this.rpc_callbackVerifyAddress);
    }

    this.send['validAddress'] = undefined;
  }

  rpc_callbackVerifyAddress(JSON: Object) {
    this.send['validAddress'] = JSON['isvalid'];
  }

  clear() {
    this.send = {
      fromType: '',
      toType: '',
      currency: 'part',
      privacy: 50
    };
  }

  pay() {
    console.log(this.type, this.send);

    const input = this.send['fromType'];
    let output = this.send['toType'];
    const address = this.send['toAddress'];
    const amount = this.send['amount'];
    const comment = this.send['note'];
    const narration = this.send['note'];
    const substractfee = false;
    const ringsize = this.send['privacy'];
    const numsigs = 1;

    const currency = this.send['currency'];

    if (input === '' ) {
      alert('You need to select an input type (public, blind or anon)!');
      return;
    }
    if (this.type === 'balanceTransfer' && output === '') {
      alert('You need to select an output type (public, blind or anon)!');
      return;
    }

    if (amount === undefined ) {
      alert('You need to enter an amount!');
      return;
    }


    if (this.verifyAmount() === false) {
      if (this.send['amount'] > this.getBalance(this.send['fromType'])) {
        alert('You\'re trying to send more money than you have.');
        return;
      }

      if ((this.send['amount'] + '').indexOf('.') >= 0 && (this.send['amount'] + '').split('.')[1].length > 8) {
        alert('The amount can only have 8 places after the decimal point.');
        return;
      }

    }

    if (this.type === 'balanceTransfer' && this.send['fromType'] === this.send['toType']) {
      alert('You have selected "' + this.send['fromType'] + '"" twice!\n Balance transfers can only happen between two different types.');
    }

    if (this.type === 'sendPayment') {
      output = input;

      if (address === undefined) {
        alert('You need to enter an address to send to!');
        return;
      }

      if (this.send['validAddress'] === false || this.send['validAddress'] === undefined) {
        alert('You entered an invalid address!');
        this.send['validAddress'] = false;
        return;
      }

      if (output === 'private' && address.indexOf('Tet') !== 0) {
        alert('Stealth address required for private transaction');
      }

      if (!confirm('Are you sure you want to send ' + amount + ' ' + currency + ' to ' + address + '?')) {
        return;
      }

      this.SendService.sendTransaction(input, output, address, amount, comment, substractfee, narration, ringsize, numsigs);
    } else if (this.type === 'balanceTransfer') {
      if (!confirm('Are you sure you want to transfer ' + amount + ' ' + currency + ' from ' + input + ' to ' + output + '?')) {
        return;
      }
      this.SendService.transferBalance(input, output, address, amount, ringsize, numsigs);
    }
    this.clear();
  }

}
