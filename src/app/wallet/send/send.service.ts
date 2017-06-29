import { Injectable } from '@angular/core';
import { AppService } from '../../app.service';

@Injectable()
export class SendService {

  private address: string = '';
  private amount: number = 0;

  constructor(private appService: AppService) { }

  sendTransaction(input: string, output: string, address: string, amount: number, comment: string, substractfee: boolean,
    narration: string, ringsize: number, numsignatures: number) {

    this.resetTransactionDetails();
    // comment is internal, narration is stored on blockchain
    const rpcCall: string = this.getSendRPCCall(input, output);
    const anon: boolean = this.isAnon(rpcCall);
    const params: Array<any> = this.getSendParams(anon, address, amount, comment, substractfee, narration, ringsize, numsignatures);

    this.setTransactionDetails(address, amount);

    this.appService.rpc.call(this, 'send' + rpcCall, params, this.rpc_send);
  }

  // TODO: blind?
  getSendRPCCall(input: string, output: string) {
    // real send (external)
    if (input === 'public' && output === 'public') {
      return 'toaddress';
    } else if (input === 'private' && output === 'private') {
      return 'anontoanon';

    // balance transfers (internal)
    } else if (input === 'private' && output === 'public') {
      return 'anontopart';
    } else if (input === 'public' && output === 'private') {
      return 'parttoanon';
    } else {
      return 'error'; // todo: real error
    }
  }

  // TODO: do I need to turn everything into strings manually?
  getSendParams(anon: boolean, address: string, amount: number, comment: string, substractfee: boolean,
    narration: string, ringsize: number, numsignatures: number) {
    if (anon) {
      // comment-to empty
      return [address, '' + amount, comment, '', '' + substractfee, narration, '' + ringsize, numsignatures];
   } else {
     // comment-to empty
      return [address, amount, comment, '', substractfee, narration];
   }
  }

  isAnon(input: string) {
    return (input === 'anontopart' || input === 'anontoanon')
  }

  rpc_send(JSON: Object) {
    // json return value is just txid
    // We can't use gettransaction just yet, becaue
    if (true) {
      console.log('rpc_send succesful ' + this.amount + ' to ' + this.address);
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
