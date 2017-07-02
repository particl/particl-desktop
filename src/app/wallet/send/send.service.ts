import { Injectable } from '@angular/core';
import { AppService } from '../../app.service';

@Injectable()
export class SendService {

  private address: string = '';
  private amount: number = 0;

  private defaultStealthAddressForBalanceTransfer: string;

  constructor(private appService: AppService) {
    this.appService.rpc.call(this, 'liststealthaddresses', null, this.rpc_callbackListDefaultAddress);
  }

  sendTransaction(input: string, output: string, address: string, amount: number, comment: string, substractfee: boolean,
    narration: string, ringsize: number, numsignatures: number) {

    this.resetTransactionDetails();
    // comment is internal, narration is stored on blockchain
    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);
    const params: Array<any> = this.getSendParams(anon, address, amount, comment, substractfee, narration, ringsize, numsignatures);

    console.log('sending tx!');
    console.log(params);
    this.setTransactionDetails(address, amount);

    this.appService.rpc.call(this, 'send' + rpcCall, params, this.rpc_send);
  }

  transferBalance(input: string, output: string, address: string, amount: number, ringsize: number, numsignatures: number) {
    this.resetTransactionDetails();
    // comment is internal, narration is stored on blockchain
    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);

    if (address === undefined) {
      address = this.defaultStealthAddressForBalanceTransfer;
    }

    const params: Array<any> = this.getSendParams(anon, this.defaultStealthAddressForBalanceTransfer,
      amount, '', false, '', ringsize, numsignatures);

    this.setTransactionDetails(this.defaultStealthAddressForBalanceTransfer, amount);

    console.log('transfering balance!');
    console.log(params);
    this.appService.rpc.call(this, 'send' + rpcCall, params, this.rpc_send);

  }

  rpc_callbackListDefaultAddress(JSON: Object) {
    if (JSON[0] !== undefined && JSON[0]['Stealth Addresses'] !== undefined && JSON[0]['Stealth Addresses'][0] !== undefined) {
      this.defaultStealthAddressForBalanceTransfer = JSON[0]['Stealth Addresses'][0]['Address'];
    } else {
      this.appService.rpc.call(this, 'getnewstealthaddress', ['balance transfer'], this.rpc_callbackSetDefaultAddress);
    }
  }

  rpc_callbackSetDefaultAddress (JSON: string) {
    this.defaultStealthAddressForBalanceTransfer = JSON;
  }

  // TODO: blind?
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
  getSendParams(anon: boolean, address: string, amount: number, comment: string, substractfee: boolean,
    narration: string, ringsize: number, numsignatures: number) {
    const params: Array<any> = [address, '' + amount, '', '', substractfee];
    if (narration !== '' && narration !== undefined) {
      params.push(narration);
    } else {
      params.push('');
    }

    if (anon) {
      // comment-to empty
      params.push(this.getRingSize(ringsize));
      // params.push(numsignatures);
    }

    return params;
  }

  isAnon(input: string) {
    return (input === 'anontopart' || input === 'anontoanon' || input === 'anontoblind' )
  }

  getRingSize(ringsize: number): number {
    if (ringsize === 100) {
      return 16;
    } else if (ringsize === 50) {
      return 8;
    } else if (ringsize === 10) {
      return 4;
    }
  }

  rpc_send(JSON: Object) {
    // json return value is just txid
    // We can't use gettransaction just yet, becaue
    if (true) {
      alert('Succesfully sent ' + this.amount + ' PART to ' + this.address + '!');
    } else {
      // error
    }
  }

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
