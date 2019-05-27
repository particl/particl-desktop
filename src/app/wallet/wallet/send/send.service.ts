import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger'

import { RpcService } from '../../../core/core.module';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

/* fix wallet */
import { FixWalletModalComponent } from 'app/wallet/wallet/send/fix-wallet-modal/fix-wallet-modal.component';
import { TransactionBuilder } from './transaction-builder.model';
import { map, take } from 'rxjs/operators';
import { Amount } from 'app/core/util/utils';

/*
  Note: due to upcoming multiwallet, we should never ever store addresses in the GUI for transaction purposes.
  e.g the stealth address for balance transfer has to be fetched _every_ time a transaction is executed.
*/

@Injectable()
export class SendService {

  log: any = Log.create('send.service');

  constructor(private _rpc: RpcService,
              private flashNotification: SnackbarService,
              private dialog: MatDialog) {
  }

  /* Sends a transaction */
  public sendTransaction(tx: TransactionBuilder) {
    tx.estimateFeeOnly = false;

    this.send(tx)
      .subscribe(
        success => this.rpc_send_success(success, tx.toAddress, tx.amount),
        error => this.rpc_send_failed(error.message, tx.toAddress, tx.amount));
  }

  public getTransactionFee(tx: TransactionBuilder): Observable<any> {
    tx.estimateFeeOnly = true;
    if (!tx.toAddress) {
      return new Observable((observer) => {
        this.getDefaultStealthAddress().pipe(take(1)).subscribe(
          (stealthAddress: string) => {
            // set balance transfer stealth address
            tx.toAddress = stealthAddress;
            this.send(tx).subscribe(fee => {
              observer.next(fee);
              observer.complete();
            });
          });
      });
    } else {
      return this.send(tx)
      .pipe(map(fee => fee));
    }
  }

  public transferBalance(tx: TransactionBuilder) {
    tx.estimateFeeOnly = false;

    // get default stealth address
    this.getDefaultStealthAddress().pipe(take(1)).subscribe(
      (stealthAddress: string) => {
        this.log.d('got transferBalance, sx' + stealthAddress);
        tx.toAddress = stealthAddress;

        // execute transaction
        this.send(tx).subscribe(
          success => this.rpc_send_success(success, stealthAddress, tx.amount),
          error => this.rpc_send_failed(error.message, stealthAddress, tx.amount));
      },
      error => this.rpc_send_failed('transferBalance, Failed to get stealth address')
    );

  }

  /**
   * Retrieve the first stealth address.
   */
  private getDefaultStealthAddress(): Observable<string> {
    return this._rpc.call('liststealthaddresses', null)
    .pipe(map(list => list[0]['Stealth Addresses'][0]['Address']));
  }

  /**
   * Executes or estimates a transaction.
   * Estimates if estimateFeeOnly === true.
   */
  private send(tx: TransactionBuilder): Observable<any> {
    return this._rpc.call('sendtypeto', [tx.input, tx.output, [{
      address: tx.toAddress,
      amount: tx.amount,
      subfee: tx.subtractFeeFromAmount,
      narr: tx.narration
    }], tx.comment, tx.commentTo, tx.ringsize, 32, tx.estimateFeeOnly]);
  }

  private rpc_send_success(json: any, address: string, amount: number) {
    this.log.d(`rpc_send_success, succesfully executed transaction with txid ${json}`);

    // Truncate the address to 16 characters only
    const trimAddress = address.substring(0, 16) + '...';
    const displayAmount = (new Amount(amount)).getAmountAsString();
    this.flashNotification.open(`Successfully sent ${displayAmount} PART to ${trimAddress}`, 'warn');
  }

  private rpc_send_failed(message: string, address?: string, amount?: number) {
    const idx = message.indexOf(']'); // End brancket of string like '[wallet.dat] ...'
    let msg = '';
    if (idx > -1) {
      msg = message.substring(idx + 1);
    } else {
      msg = message;
    }

    this.flashNotification.open(`Transaction failed: ${msg}`, 'err');
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

}
