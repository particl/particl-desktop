import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger'

import { RpcService } from '../../../core/core.module';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

/* fix wallet */
import { MatDialog } from '@angular/material';
import { FixWalletModalComponent } from 'app/wallet/wallet/send/fix-wallet-modal/fix-wallet-modal.component';



@Injectable()
export class SendService {

  // success alert box
  private address: string = '';
  private amount: number = 0;

  // stealth address used for all balance transfers
  private defaultStealthAddressForBalanceTransfer: string;
  public isSubstractfeefromamount: boolean = false;

  log: any = Log.create('send.service');


  /*

    RPC LOGIC

  */

  constructor(public _rpc: RpcService,
              private flashNotification: SnackbarService,
              private dialog: MatDialog) {
    this._rpc.call('liststealthaddresses', null)
      .subscribe(response => {
        this.rpc_listDefaultAddress_success(response)
      },
      error => {
        this.log.er('errr');
      });
  }

  rpc_listDefaultAddress_success(json: Object) {
    if (json[0] !== undefined && json[0]['Stealth Addresses'] !== undefined && json[0]['Stealth Addresses'][0] !== undefined) {
      this.rpc_setDefaultAddress_success(json[0]['Stealth Addresses'][0]['Address']);
    } else {
      // this._rpc.oldCall(this, 'getnewstealthaddress', ['balance transfer'], this.rpc_setDefaultAddress_success);
      this._rpc.call('getnewstealthaddress', ['balance transfer'])
        .subscribe(
          (response: any) => {
            this.rpc_setDefaultAddress_success(response)
        },
        error => {
          this.log.er('rpc_listDefaultAddress_success: liststealthaddresses failed');
        });
    }
  }

  rpc_setDefaultAddress_success (json: any) {
    this.defaultStealthAddressForBalanceTransfer = json;
    this.log.d(`rpc_setDefaultAddress_success, stealth address: ${json}`);
  }

  public getBalanceTransferAddress(): string {
    return this.defaultStealthAddressForBalanceTransfer;
  }

  /*
  * Sends a transactions
  */
  sendTransaction(
    input: string, output: string, address: string,
    amount: number, comment: string, narration: string,
    ringsize: number, numsignatures: number) {

    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);
    const params: Array<any> = this.getSendParams(
      anon, address, amount, comment,
      narration, ringsize, numsignatures);

    this._rpc.call('send' + rpcCall, params)
      .subscribe(
        success => this.rpc_send_success(success, address, amount),
        error => this.rpc_send_failed(error, address, amount));
  }

  transferBalance(
    input: string, output: string, address: string,
    amount: number, ringsize: number, numsignatures: number) {

    // comment is internal, narration is stored on blockchain
    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);

    this.log.d('transferBalance, sx' + this.defaultStealthAddressForBalanceTransfer);
    if (!!address) {
      address = this.defaultStealthAddressForBalanceTransfer;
    }

    const params: Array<any> = this.getSendParams(
      anon, this.defaultStealthAddressForBalanceTransfer,
      amount, '', '', ringsize, numsignatures);

    // this._rpc.oldCall(this, 'send' + rpcCall, params, this.rpc_send_success, this.rpc_send_failed);
    this._rpc.call('send' + rpcCall, params).subscribe(
      success => this.rpc_send_success(success, address, amount),
      error => this.rpc_send_failed(error, address, amount));
  }


  rpc_send_success(json: any, address: string, amount: number) {
    this.log.d(`rpc_send_success, succesfully executed transaction with txid ${json}`);

    // Truncate the address to 16 characters only
    const trimAddress = this.address.substring(0, 16) + '...';
    const txsId = json.substring(0, 45) + '...';
    this.flashNotification.open(`Succesfully sent ${this.amount} PART to ${trimAddress}!\nTransaction id: ${txsId}`, 'warn');
  }

  rpc_send_failed(json: any, address: string, amount: number) {
    this.flashNotification.open(`Transaction Failed ${json.message}`, 'err');
    this.log.er('rpc_send_failed, failed to execute transaction!');
    this.log.er(json);

    /* Detect bug in older wallets with Blind inputs */
    if (json.message.contains('AddBlindedInputs: GetBlind failed for')) {
      this.fixWallet();
    }
  }

  /*
    AddBlindedInput issue, open modal to fix it.
  */
  fixWallet(): void {
    const dialogRef = this.dialog.open(FixWalletModalComponent);

    dialogRef.afterClosed().subscribe(
      (result) => {
        this.log.d('FixWalletModal closing');
      }
    );
  }


  /*
    Helper functions for RPC
  */


  // TODO: blind?

  /**
    * Returns a part of the method of the RPC call required to execute the transaction
    *
    * @param {string} input  From which type/balance we should send the funds (public, blind, anon)
    * @param {string} output  To which type/balance we should send the funds (public, blind, anon)
    *
    */
  getSendRPCCall(input: string, output: string) {
    // real send (external)
    if (input === 'balance' && output === 'balance') {
      return 'toaddress';
    } else if (input === 'anon_balance' && output === 'anon_balance') {
      return 'anontoanon';
    } else if (input === 'blind_balance' && output === 'blind_balance') {
      return 'blindtoblind';

    // balance transfers (internal)
    } else if (input === 'anon_balance' && output === 'balance') {
      return 'anontopart';
    } else if (input === 'balance' && output === 'anon_balance') {
      return 'parttoanon';
    } else if (input === 'balance' && output === 'blind_balance') {
      return 'parttoblind';
    } else if (input === 'anon_balance' && output === 'blind_balance') {
      return 'anontoblind';
    } else if (input === 'blind_balance' && output === 'balance') {
      return 'blindtopart';
    } else if (input === 'blind_balance' && output === 'anon_balance') {
      return 'blindtoanon';
    } else {
      return 'error'; // todo: real error
    }
  }

  // TODO: do I need to turn everything into strings manually?
  /** A helper function that transforms the transaction details to an array with the right params (for passing to the RPC service). */
  getSendParams(
    anon: boolean, address: string, amount: number, comment: string,
    narration: string, ringsize: number, numsignatures: number) {
    const substractfeefromamount: boolean = this.isSubstractfeefromamount;
    const params: Array<any> = [address, amount, '', '', substractfeefromamount];

    params.push(!!narration ? narration : '');

    if (anon) {
      // comment-to empty
      params.push(this.getRingSize(ringsize));
      // params.push(numsignatures);
    }

    return params;
  }

  /**
  * Returns true if the RPC method is anonto...
  */
  isAnon(input: string) {
    return (input === 'anontopart' || input === 'anontoanon' || input === 'anontoblind' )
  }

  /**
  * Converts slider logic (0 -> 100) to actual ring size for RPC parameters.
  */
  getRingSize(ringsize: number): number {
    if (ringsize === 100) {
      return 16;
    } else if (ringsize === 50) {
      return 8;
    } else if (ringsize === 10) {
      return 4;
    }
  }
}
