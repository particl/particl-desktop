import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface IWallet {
  name: string
}

@Injectable()
export class MultiwalletService {

  private _list: BehaviorSubject<Array<IWallet>> = new BehaviorSubject([]);

  constructor() { 
    this.listen();
  }

  /**
   * Listen to the backend for changes in the wallet.dat files
   * New ones added or deleted ones.
   */
  private listen() {
    // http request
    // subscribe to server side stream
    // and load the wallets in _list.
    const wallet = {
      name: 'wallet'
    }
    this.add(wallet)

  }

  /**
   * Add a wallet to the list.
   */
  private add(wallet: IWallet) {
    // TODO: should we clone the object?
    // we don't actually have to .next() it
    // as they both hold the same reference
    // to the underlying list instance.
    this._list.value.push(wallet)
  }

  /**
   * Returns a list of available wallets on the system.
   */
  get list(): BehaviorSubject<Array<IWallet>> {
    return this._list;
  }
}
