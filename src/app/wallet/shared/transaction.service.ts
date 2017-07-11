import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger'

import { Transaction, deserialize, TEST_TXS_JSON, TEST_ARRAY_TXS_JSON_PAGE_0, TEST_ARRAY_TXS_JSON_PAGE_1 } from './transaction.model';

import { RPCService } from '../../core/rpc/rpc.service';

@Injectable()
export class TransactionService {

  log: any = Log.create('transaction.service');

  /* Stores transactions objects. */
  txs: Transaction[] = [];

  /* Pagination stuff */
  txCount: number = 0;
  currentPage: number = 0;
  totalPageCount: number = 0;


  /* How many transactions do we display per page and keep in memory at all times.
     When loading more transactions they are fetched JIT and added to txs. */
  MAX_TXS_PER_PAGE: number = 10;

  constructor(
    private rpc: RPCService
  ) {}


  postConstructor(MAX_TXS_PER_PAGE: number) {
    this.MAX_TXS_PER_PAGE = MAX_TXS_PER_PAGE;
    this.rpc_update();
  }


/*
  UTIL
*/

  changePage(page: number) {
    if (page <= 0) {
      return;
    }

    page--;
    this.currentPage = page;
    this.deleteTransactions();
    this.rpc_update();
  }

  deleteTransactions() {
    this.txs = [];
  }

/*
  _____  _____   _____
 |  __ \|  __ \ / ____|
 | |__) | |__) | |
 |  _  /|  ___/| |
 | | \ \| |    | |____
 |_|  \_\_|     \_____|


*/

/*
  Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array.

*/


  rpc_update() {
    this.rpc.call(this, 'getwalletinfo', null, this.rpc_loadTransactionCount);
  }

  rpc_loadTransactionCount(JSON: Object): void {
    this.txCount = JSON['txcount'];

    this.log.d('rpc_loadTransactionCount, txcount:', this.txCount);
    this.log.d('rpc_loadTransactionCount, rpc_getParameters():', this.rpc_getParameters());

    this.rpc.call(this, 'listtransactions', this.rpc_getParameters(), this.rpc_loadTransactions);
  }

  rpc_loadTransactions(JSON: Array<Object>): void {
      /*
        The callback will send over an array of JSON transaction objects.

      */

    for (let i = 0; i < JSON.length; i++) {
      const json: Object = JSON[i];
      this.addTransaction(json);
    }
  }

  rpc_getParameters() {
    return ['*', +this.MAX_TXS_PER_PAGE, ((this.currentPage ? this.currentPage - 1 : 0) * this.MAX_TXS_PER_PAGE)];
  }

  // Deserializes JSON objects to Transaction classes.
  // This does not enforce statically typed stuff at runtime tho, there is one lib called TypedJSON that does.
  addTransaction(json: Object): void {
    const instance: Transaction = deserialize(json, Transaction);
    if (typeof instance.txid === 'undefined') {
      return;
    }

    // this.txs.push(instance);
    this.txs.splice(0, 0, instance);
  }

}
