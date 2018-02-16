import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger'

import { RpcService } from '../../../core/core.module';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

/* fix wallet */
import { MatDialog } from '@angular/material';
import { FixWalletModalComponent } from 'app/wallet/wallet/send/fix-wallet-modal/fix-wallet-modal.component';
import { TransactionBuilder } from './transaction-builder.model';

/*
  Note: due to upcoming multiwallet, we should never ever store addresses in the GUI for transaction purposes.
  e.g the stealth address for balance transfer has to be fetched _every_ time a transaction is executed.
*/

@Injectable()
export class SendService {

  log: any = Log.create('send.service');

  constructor(public _rpc: RpcService,
              private flashNotification: SnackbarService,
              private dialog: MatDialog) {

  }

  /* Sends a transaction */
  // @TODO: estimate fee should be change
  public sendTransaction(tx: TransactionBuilder) {
    tx.comment = tx.narration = tx.note;

    const rpcCall: string = this.getSendRPCCall(tx.input, tx.output);
    const anon: boolean = this.isAnon(rpcCall);
    const params: Array<any> = this.getSendParams(
      anon, tx.toAddress, tx.amount, tx.comment,
      tx.narration, tx.privacy, tx.numsignatures, tx.subtractFeeFromAmount);

    this._rpc.call('send' + rpcCall, params)
      .subscribe(
        success => this.rpc_send_success(success, tx.toAddress, tx.amount),
        error => this.rpc_send_failed(error.message, tx.toAddress, tx.amount));
  }

  // @TODO refactor this method for balance transfer without address
  public getTransactionFee(tx: TransactionBuilder): Observable<any> {
    // this.getDefaultStealthAddress().take(1).subscribe(
    //   (stealthAddress: string) => {
    //
    //   });
    return this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: tx.toAddress,
      amount: tx.amount,
    }], '', '', 8, 64, true]).map(
      fee => fee);
  }

  public transferBalance(tx: TransactionBuilder) {

    // get default stealth address
    this.getDefaultStealthAddress().take(1).subscribe(
      (stealthAddress: string) => {
        this.log.d('got transferBalance, sx' + stealthAddress);

        // comment is internal, narration is stored on blockchain
        const rpcCall: string = this.getSendRPCCall(tx.input, tx.output);
        const anon: boolean = this.isAnon(rpcCall);
        const params: Array<any> = this.getSendParams(
          anon, stealthAddress,
          tx.amount, '', '', tx.privacy, tx.numsignatures, tx.subtractFeeFromAmount);

        this._rpc.call('send' + rpcCall, params).subscribe(
          success => this.rpc_send_success(success, stealthAddress, tx.amount),
          error => this.rpc_send_failed(error.message, stealthAddress, tx.amount));
      },
      error => this.rpc_send_failed('Failed to get stealth address')
    );

  }

  /* Retrieve the first stealth address */
  private getDefaultStealthAddress(): Observable<string> {
    return this._rpc.call('liststealthaddresses', null).map(
      list => list[0]['Stealth Addresses'][0]['Address']);
  }

  rpc_send_success(json: any, address: string, amount: number) {
    this.log.d(`rpc_send_success, succesfully executed transaction with txid ${json}`);

    // Truncate the address to 16 characters only
    const trimAddress = address.substring(0, 16) + '...';
    const txsId = json.substring(0, 45) + '...';
    this.flashNotification.open(`Succesfully sent ${amount} PART to ${trimAddress}!\nTransaction id: ${txsId}`, 'warn');
  }

  rpc_send_failed(message: string, address?: string, amount?: number) {
    this.flashNotification.open(`Transaction Failed ${message}`, 'err');
    this.log.er('rpc_send_failed, failed to execute transaction!');
    this.log.er(message);

    /* Detect bug in older wallets with Blind inputs */
    // AddBlindedInputs: GetBlind failed for
    if (message.search('AddBlindedInput') !== -1) {
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

  /**
    * Returns a part of the method of the RPC call required to execute the transaction
    *
    * @param {string} input  From which type/balance we should send the funds (public, blind, anon)
    * @param {string} output  To which type/balance we should send the funds (public, blind, anon)
    *
    */
  getSendRPCCall(input: string, output: string) {

    input = input.replace('_balance', '').replace('balance', 'part');
    output = output.replace('_balance', '').replace('balance', 'part');
    if (input === 'part' && output === 'part') {
      return 'toaddress';
    } else {
      return input + 'to' + output;
    }
  }

  // TODO: do I need to turn everything into strings manually?
  /** A helper function that transforms the transaction details to an array with the right params (for passing to the RPC service). */
  getSendParams(
    anon: boolean, address: string, amount: number, comment: string,
    narration: string, ringsize: number, numsignatures: number, substractfeefromamount: boolean) {

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
  isAnon(input: string): boolean {
    return ['anontopart', 'anontoanon', 'anontoblind'].includes(input)
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
