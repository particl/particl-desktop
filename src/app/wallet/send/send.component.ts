import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Log } from 'ng2-logger';

import { SendService } from './send.service';
import { BalanceService } from '../balances/balance.service';
import { Subscription } from 'rxjs/Subscription';
import { EncryptionStatusService, RPCService } from '../../core/rpc/rpc.module';
import { ModalsService } from '../../modals/modals.service';

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
    input: 'public',
    output: 'public',
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
    private balanceService: BalanceService,
    private _rpc: RPCService,
    private _modals: ModalsService,
    private _encryptionStatus: EncryptionStatusService
  ) {
  }


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

  sendTab(tabIndex: number) {
    if (tabIndex) {
      this.type = 'balanceTransfer';
    } else {
      this.type = 'sendPayment';
    }

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

  /** Amount validation functions. */
  checkAmount(): boolean {
    // hooking verifyAmount here, on change of type -> retrigger check of amount.
    this.verifyAmount();

    return this.send.validAmount;
  }

  verifyAmount() {

    if (this.send.amount === undefined || +this.send.amount === 0 || this.send.input === '') {

      this.send.validAmount = undefined;
      return;
    }

    if ((this.send.amount + '').indexOf('.') >= 0 && (this.send.amount + '').split('.')[1].length > 8) {
      this.send.validAmount = false;
      return;
    }

    this.send.validAmount = this.send.amount <= this.getBalance(this.send.input);
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
      input: '',
      output: '',
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
      if (this.send.output === 'private' && this.send.toAddress.length < 35) {
        alert('Stealth address required for private transactions!');
        return;
      }

      // Check if wallet is unlocked
      if (this._encryptionStatus.getEncryptionStatusState() !== 'Unlocked') {

        // unlock wallet and send transaction
        this._modals.unlockWallet(this,
          this.sendTransaction,
          2);


      } else {
        // wallet already unlocked
        this.sendTransaction();
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

      if (this._encryptionStatus.getEncryptionStatusState() !== 'Unlocked') {
        // unlock wallet and transfer balance
        this._modals.unlockWallet(this,
          this.transferBalance,
          2);
      } else {
        this.transferBalance();
      }

    }
  }



  sendTransaction(): void {

    // edit label of address
    this.addLabelToAddress();

    this.sendService.sendTransaction(
      this.send.input, this.send.output, this.send.toAddress,
      this.send.amount, this.send.note, false, this.send.note,
      this.send.privacy, 1);

    this.clear();
  }

  transferBalance(): void {

    const input = this.send.input;
    const output = this.send.output;
    const address = this.send.toAddress;
    const amount = this.send.amount;
    const ringsize = this.send.privacy;
    const numsigs = 1;

    this.sendService.transferBalance(
      this.send.input, this.send.output, this.send.toAddress,
      this.send.amount, this.send.privacy, 1);

    this.clear();
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

    /*
    if (isMine) {
      if (!confirm('Address is one of our own - change label? ')) {
        return;
      }
    }*/

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
