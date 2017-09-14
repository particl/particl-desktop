import { Injectable } from '@angular/core';
import { RPCService } from '../../core/rpc/rpc.module';

import { Log } from 'ng2-logger'
import {FlashNotificationService} from "../../services/flash-notification.service";


@Injectable()
export class SendService {

  // success alert box
  private address: string = '';
  private amount: number = 0;

  // stealth address used for all balance transfers
  private defaultStealthAddressForBalanceTransfer: string;

  log: any = Log.create('send.service');


  /*

    RPC LOGIC

  */

  constructor(public _rpc: RPCService,
              private flashNotification: FlashNotificationService) {
    // this._rpc.oldCall(this, 'liststealthaddresses', null, this.rpc_listDefaultAddress_success);
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
          this.log.er('errr');
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
  sendTransaction(input: string, output: string, address: string, amount: number, comment: string, substractfee: boolean,
    narration: string, ringsize: number, numsignatures: number) {

    this.resetTransactionDetails();

    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);
    const params: Array<any> = this.getSendParams(anon, address, amount, comment, substractfee, narration, ringsize, numsignatures);

    this.setTransactionDetails(address, amount);

    // this._rpc.oldCall(this, 'send' + rpcCall, params, this.rpc_send_success, this.rpc_send_failed);
    this._rpc.call('send' + rpcCall, params)
        .subscribe(
          (response: any) => {
          this.rpc_send_success(response)
        },
        (error: any) => {
          this.rpc_send_failed(error);
        });
  }

  transferBalance(input: string, output: string, address: string, amount: number, ringsize: number, numsignatures: number) {
    this.resetTransactionDetails();
    // comment is internal, narration is stored on blockchain
    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);

    this.log.d('transferBalance, sx' + this.defaultStealthAddressForBalanceTransfer);
    if (address === undefined || address === '') {
      address = this.defaultStealthAddressForBalanceTransfer;
    }

    const params: Array<any> = this.getSendParams(anon, this.defaultStealthAddressForBalanceTransfer,
      amount, '', false, '', ringsize, numsignatures);

    this.setTransactionDetails(this.defaultStealthAddressForBalanceTransfer, amount);

    // this._rpc.oldCall(this, 'send' + rpcCall, params, this.rpc_send_success, this.rpc_send_failed);
    this._rpc.call('send' + rpcCall, params)
      .subscribe(
        (response: any) => {
          this.rpc_send_success(response)
      },
      (error: any) => {
          this.rpc_send_failed(error);
      });
  }


  rpc_send_success(json: any) {
    this.log.d(`rpc_send_success, succesfully executed transaction with txid ${json}`);
    this.flashNotification.open(`Succesfully sent ${this.amount} PART to ${this.address}!\nTransaction id: ${json}`);
  }

  rpc_send_failed(json: any) {
    this.log.er('rpc_send_failed, failed to execute transactions!');
    this.log.er(json);
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
    if (input === 'public' && output === 'public') {
      return 'toaddress';
    } else if (input === 'private' && output === 'private') {
      return 'anontoanon';
    } else if (input === 'blind' && output === 'blind') {
      return 'blindtoblind';

    // balance transfers (internal)
    } else if (input === 'private' && output === 'public') {
      return 'anontopart';
    } else if (input === 'public' && output === 'private') {
      return 'parttoanon';
    } else if (input === 'public' && output === 'blind') {
      return 'parttoblind';
    } else if (input === 'private' && output === 'blind') {
      return 'anontoblind';
    } else if (input === 'blind' && output === 'public') {
      return 'blindtopart';
    } else if (input === 'blind' && output === 'private') {
      return 'blindtoanon';
    } else {
      return 'error'; // todo: real error
    }
  }

  // TODO: do I need to turn everything into strings manually?
/**
 * A helper function that transforms the transaction details to an array with the right params (for passing to the RPC service).
 *
 */
  getSendParams(anon: boolean, address: string, amount: number, comment: string, substractfee: boolean,
    narration: string, ringsize: number, numsignatures: number) {
    const params: Array<any> = [address, '' + amount, '', '', substractfee];

    if (narration !== '' && narration !== undefined) {
      params.push(narration);
    } else {
      params.push(' '); // TODO: remove space
    }

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


  /*

    UI LOGIC

  */


    /*
      We need to display a success modal when a transaction went through,
      if succesful it needs to have the address and amount.

      gettransaction is broke, it returns an error for blind transactions given the txid.
      We're just storing it here and resetting it on every tx. (or second option is grabbing it from the component UI).
    */

  setTransactionDetails(address: string, amount: number) {
    this.address = address;
    this.amount = amount;
  }

  resetTransactionDetails() {
    this.address = '';
    this.amount = 0;
  }
}
