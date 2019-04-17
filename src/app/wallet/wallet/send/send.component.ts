
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatSliderChange } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals.module';
import { RpcService } from 'app/core/rpc/rpc.service';
import { RpcStateService } from '../../../core/rpc/rpc-state/rpc-state.service';

import { SendService } from './send.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { AddressLookupComponent } from '../addresslookup/addresslookup.component';
import { AddressLookUpCopy } from '../models/address-look-up-copy';

import { AddressHelper } from '../../../core/util/utils';
import { TransactionBuilder, TxType } from './transaction-builder.model';
import {
  SendConfirmationModalComponent
} from 'app/modals/send-confirmation-modal/send-confirmation-modal.component';
import { take, takeWhile } from 'rxjs/operators';
import { Amount } from 'app/core/util/utils';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit, OnDestroy {

  // General
  log: any = Log.create('send.component');
  private addressHelper: AddressHelper;
  private destroyed: boolean = false;

  testnet: boolean = false;
  // UI logic
  @ViewChild('address') address: ElementRef;
  type: string = 'sendPayment';
  advanced: boolean = false;
  // TODO: Create proper Interface / type
  public send: TransactionBuilder;
  private availableBal: Amount = new Amount(0);

  public TxType: typeof TxType = TxType;

  constructor(
    private sendService: SendService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,

    // @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    private modals: ModalsHelperService,
    private dialog: MatDialog,
    private flashNotification: SnackbarService
  ) {
    this.addressHelper = new AddressHelper();
    this.setFormDefaultValue();
  }

  setFormDefaultValue() {
    this.send = new TransactionBuilder();
    // it should reset output on the basis of type
    if (this.type === 'balanceTransfer') {
      this.send.output = TxType.BLIND;
    }
  }

  ngOnInit() {
    /* check if testnet -> Show/Hide Anon Balance */
    this._rpcState.observe('getblockchaininfo', 'chain').pipe(take(1))
      .subscribe(chain => this.testnet = chain === 'test');

    // Calculate Spendable balance
    this._rpcState.observe('listunspent')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        unspent => {
          let tempAmount = 0;
          for (let ut = 0; ut < unspent.length; ut++) {
            if (!unspent[ut].coldstaking_address || unspent[ut].address) {
              tempAmount += unspent[ut].amount;
            };
          }
          this.availableBal = new Amount(tempAmount, 8);
        },
        error => this.log.error('Failed to get balance, ', error));
  }



  /** Select tab */
  selectTab(tabIndex: number): void {
    this.advanced = false;
    this.type = (tabIndex) ? 'balanceTransfer' : 'sendPayment';
    this.send.input = TxType.PUBLIC;
    this.send.output = TxType.PUBLIC;
    if (this.type === 'balanceTransfer') {
      this.send.toAddress = '';
      this.send.output = TxType.BLIND;
      this.verifyAddress();
    }
    this.updateAmount();
  }

  /** Get current account balance (Public / Blind / Anon) */
  availableBalance(account: TxType): number {
    const balance = this.txTypeToBalanceType(account);

    if (balance === 'balance') {
      return this.availableBal.getAmount();
    }
    return (this._rpcState.get('getwalletinfo') || {})[balance] || 0;
  }

  balanceDisplay(account: TxType): string {
    return new Amount(this.availableBalance(account)).getAmountAsString();
  }

  showBalanceHelp(account: TxType): boolean {
    const amount = this.availableBalance(account);
    return (amount < 0.0001) &&  (amount > 0);
  }

  private txTypeToBalanceType(type: TxType): string {
    let r: string;
    switch (type) {
      case TxType.PUBLIC:
        r = 'balance';
        break;
      case TxType.BLIND:
        r = 'blind_balance';
        break;
      case TxType.ANON:
        r = 'anon_balance';
        break;
    }
    return r;
  }

  /** Amount validation functions. */
  checkAmount(): boolean {
    // hooking verifyAmount here, on change of type -> retrigger check of amount.
    this.verifyAmount();

    return this.send.validAmount;
  }

  verifyAmount(): void {

    if ( +(this.send.amount || 0) === 0 ) {
      this.send.validAmount = false;
      return;
    }

    // if ((this.send.amount + '').indexOf('.') >= 0 && (this.send.amount + '').split('.')[1].length > 8) {
    //   this.send.validAmount = false;
    //   return;
    // }

    if (+this.send.amount <= 1e-8) {
      this.send.validAmount = false;
      return;
    }
    // is amount in range of 0...CurrentBalance
    this.send.validAmount = (this.send.amount <= this.availableBalance(this.send.input) && this.send.amount > 0);
  }

  /** checkAddres: returns boolean, so it can be private later. */
  checkAddress(): boolean {
    if (this.send.input !== TxType.PUBLIC && this.addressHelper.testAddress(this.send.toAddress, 'public')) {
      return false;
    }

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

  clearReceiver(): void {
    this.send.toLabel = '';
    this.send.toAddress = '';
    this.send.validAddress = undefined;
  }

  onSubmit(): void {
    this.modals.unlock({timeout: 30}, (status) => this.openSendConfirmationModal());
  }

  setInputOutput(txType: string, payType: string ): void {
    if (this.type === 'balanceTransfer') {
      switch (txType) {
        case TxType.BLIND:
          if (TxType.BLIND === this.send[payType]) {
            this.send[payType] = TxType.PUBLIC;
          }
          break;
        case TxType.ANON:
          if (TxType.ANON === this.send[payType]) {
            this.send[payType] = TxType.PUBLIC;
          }
          break;
        default:
          if (TxType.PUBLIC === this.send[payType]) {
            this.send[payType] = TxType.BLIND;
          }
          break;
      }
    }
  }

  /** Open Send Confirmation Modal */
  openSendConfirmationModal() {
    const dialogRef = this.dialog.open(SendConfirmationModalComponent);

    let txt = `Do you really want to send ${this.send.amount} ${this.send.currency.toUpperCase()} to ${this.send.toAddress}?`;
    if (this.type === 'balanceTransfer') {
      txt = `Do you really want to transfer the following balance ${this.send.amount} ${this.send.currency.toUpperCase()}?`
    }

    dialogRef.componentInstance.dialogContent = txt;
    dialogRef.componentInstance.send = this.send;

    dialogRef.componentInstance.onCancel.subscribe(() => {
      dialogRef.close();
      if (this.type === 'balanceTransfer') {
        this.send.toAddress = '';
      }
    });

    dialogRef.componentInstance.onConfirm.subscribe(() => {
      dialogRef.close();
      this.pay();
    });
  }

  /** Payment function */
  pay(): void {
    if (!this.send.input) {
      this.flashNotification.open('You need to select an input type (public, blind or anon)!');
      return;
    }

    // Send normal transaction - validation
    if (this.type === 'sendPayment') {

      // pub->pub, blind->blind, priv-> priv
      this.send.output = this.send.input;

      // Check if stealth address if output is private
      if (this.send.output === TxType.ANON && !this.addressHelper.testAddress(this.send.toAddress, 'private')) {
        this.flashNotification.open('Stealth address required for private transactions!');
        return;
      }
    }
    this.modals.unlock({ timeout: 30 }, (status) => this.sendTransaction());
  }

  private sendTransaction(): void {
    if (this.type === 'sendPayment') {
      // edit label of address
      this.addLabelToAddress();

      this.sendService.sendTransaction(this.send);
    } else {

      this.sendService.transferBalance(this.send);
    }
    this.setFormDefaultValue();
  }
  /*
    AddressLookup Modal + set details
  */

  openLookup(): void {
    const d = this.dialog.open(AddressLookupComponent);
    const dc = d.componentInstance;
    dc.type = (this.type === 'balanceTransfer') ? 'receive' : 'send';
    dc.filter = (
      [TxType.ANON, TxType.BLIND].includes(this.send.input) ? 'Private' : 'All types');
    dc.selectAddressCallback.subscribe((response: AddressLookUpCopy) => {
      this.selectAddress(response);
      d.close();
    });
  }

  /** Select an address, set the appropriate models
    * @param address The address to send to
    * @param label The label for the address.
    */
  selectAddress(copyObject: AddressLookUpCopy): void {
    this.send.toAddress = copyObject.address;
    this.send.toLabel = copyObject.label;
    // this.addressLookup.hide();
    this.verifyAddress();
  }

  /** Add/edits label of an address. */
  addLabelToAddress(): void {
    const isMine = this.send.isMine;

    /*
    if (isMine) {
      if (!confirm('Address is one of our own - change label? ')) {
        return;
      }
    }*/
    if (this.send.toLabel === '') {
      this.send.toLabel = 'Empty Label'
    }
    const label = this.send.toLabel;
    const addr = this.send.toAddress;

    this._rpc.call('manageaddressbook', ['newsend', addr, label])
      .subscribe(
      response => this.log.er('rpc_addLabel_success: successfully added label to address.'),
      error => this.log.er('rpc_addLabel_failed: failed to add label to address.'))
  }

  setPrivacy(level: number): void {
    this.send.ringsize = level;
  }

  onSlide(option: MatSliderChange): void {
    this.setPrivacy(option.value);
  }

  pasteAddress(): void {
    // document.getElementById('address').focus();
    this.address.nativeElement.focus();
    document.execCommand('Paste');
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: any) {
    if (this.addressHelper.addressFromPaste(event)) {
      this.address.nativeElement.focus();
    }
  }

  sendAllBalance(): void {
    this.send.amount = !this.send.subtractFeeFromAmount ? this.availableBalance(this.send.input) : null;
  }

  updateAmount(): void {
    this.send.amount = (this.send.subtractFeeFromAmount) ? this.availableBalance(this.send.input) : null;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
