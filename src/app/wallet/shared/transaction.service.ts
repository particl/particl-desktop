import { Injectable } from '@angular/core';
import { Transaction, deserialize, TEST_TXS_JSON } from './transaction.model';


@Injectable()
export class TransactionService {
  /* Stores transactions objects. */
  txs: Transaction[] = [];

  /* Pagination stuff */
  txCount: number = 0;
  currentPage: number = 0;
  totalPageCount: number = 0;


  /* How many transactions do we display per page and keep in memory at all times.
     When loading more transactions they are fetched JIT and added to txs. */
  MAX_TXS_PER_PAGE: number = 4;

  constructor() {
    this.initializeTestData();
  }


  // Pull test data and populate array of txs.
  initializeTestData(): void {
    this.txCount = TEST_TXS_JSON.length;
    this.loadTestTransaction(0);
  }

  loadTestTransaction(index_start: number): void {

  /* The oldest transactions are the first ones to be displayed, so we must reverse the order and
     calculate the real index first. */
    let real_index_start: number;
    if (this.txCount > this.MAX_TXS_PER_PAGE) {
      real_index_start = this.txCount - (index_start + 1) * this.MAX_TXS_PER_PAGE;
    } else {
      real_index_start = 0;
    }

    for (let i = 0; i < this.MAX_TXS_PER_PAGE; i++) {
      const json: Object = TEST_TXS_JSON[real_index_start + i];
      this.addTransaction(json);
    }
   }
/*


  _    _ _______ _____ _
 | |  | |__   __|_   _| |
 | |  | |  | |    | | | |
 | |  | |  | |    | | | |
 | |__| |  | |   _| |_| |____
  \____/   |_|  |_____|______|


*/

  changePage(page: number) {
    if (page <= 0) {
      return;
    }

    page--;
    this.currentPage = page;
    this.deleteTransactions();
    this.rpc_loadTransactions(page);
  }

  /* not needed probably
  updatePageCount() : number {
    this.totalPageCount = Math.ceil(this.txCount/this.MAX_TXS_PER_PAGE);
    if(this.currentPage != 0){
      let residual = this.txCount % this.MAX_TXS_PER_PAGE;
      if(residual == 0) //new page
        this.currentPage++;
    }
    return this.totalPageCount;
  }
 */

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

  rpc_loadTransactions(index_start: number): void {
    this.loadTestTransaction(index_start);
    // loadTransactionsRPC should call listtransaction amount index_start.
    // return this.txs;
  }

  rpc_loadTransactionCount(): void {
    //to be modified or deleted; RPC will push this data
    // call getwalletinfo txcount
    this.txCount = TEST_TXS_JSON.length - 1;
  }

  rpc_getParameters() {
    return ('"*" ' + this.MAX_TXS_PER_PAGE + ' ' + this.currentPage);
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

  callback_updateTransactions(JSON: Array<Object>): void {
      /*
        The callback will send over an array of JSON transaction objects.

      */
  }

/*


   _____ _____ _____ _   _          _
  / ____|_   _/ ____| \ | |   /\   | |
 | (___   | || |  __|  \| |  /  \  | |
  \___ \  | || | |_ | . ` | / /\ \ | |
  ____) |_| || |__| | |\  |/ ____ \| |____
 |_____/|_____\_____|_| \_/_/    \_\______|



*/

  register_newTxService(/* RPC-service */): void {
    /*
      This function registers this transaction service instance with the CENTRALIZED RPC-service
      which in turn will conteniously callback with updates.

      A central RPC-service is required for a good design, we want to maintain one connection to
      the RPC and not spawn a new one for each TxService.
    */
  }
  signal_newTransaction(): void {
    /*
      _MIGHT_ BE DELETED.
      When bitcoind finds a new transaction, it must signal it to the GUI.
      We constantly need to be aware of the latest transactions for a good UX,
      another good reason is that the RPC call listtransactions uses indexes to track the transactions.

    
     This functionality of this function is potentially moved to the RPC service. This service is being "dumbed down" to doing basic UI logic, we'll have one function
     that feeds in the data for the component to fetch.



    */
  }
}
