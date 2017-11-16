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
  count: number = 0;
  /* states */
  loading: boolean = false;
  testnet: boolean = false;


  /* How many transactions do we display per page and keep in memory at all times.
     When loading more transactions they are fetched JIT and added to txs. */
  MAX_TXS_PER_PAGE: number = 10;
  PAGE_SIZE_OPTIONS: Array<number> = [5, 10, 20];

  constructor(private rpc: RPCService) {
  }

  postConstructor(MAX_TXS_PER_PAGE: number) {
    this.MAX_TXS_PER_PAGE = MAX_TXS_PER_PAGE;
    this.log.d(`postconstructor  called txs array: ${this.txs.length}`);
    console.log(this.count);
    // TODO: why is this being called twice after executing a tx?
    // SomeTimes tx has previous value in zero position
    this.rpc.state.observe('txcount')
      .subscribe(
        txcount => {
          this.loading = true;
          this.txCount = txcount;
          this.log.d(`observing txcount, txs array: ${this.txs.length}`);
          this.rpc_update();
        });

    /* check if testnet -> block explorer url */
    this.rpc.state.observe('chain').take(1)
    .subscribe(chain => this.testnet = chain === 'test');
  }


  changePage(page: number) {
    if (page < 0) {
      return;
    }
    this.loading = true;
    this.currentPage = page;
    this.rpc_update();
  }

  deleteTransactions() {
    this.txs = [];
  }

  /** Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array. */
  rpc_update() {

    this.rpc.call('listtransactions', [
      '*', +this.MAX_TXS_PER_PAGE,
      (this.currentPage * this.MAX_TXS_PER_PAGE)
    ])
    .subscribe(
      (txResponse: Array<Object>) => {
        // The callback will send over an array of JSON transaction objects.
        this.log.d(`rpc_loadTransactions_success, supposedly tx per page: ${this.MAX_TXS_PER_PAGE}`);
        this.log.d(`rpc_loadTransactions_success, real tx per page: ${txResponse.length}`);

        if (txResponse.length !== this.MAX_TXS_PER_PAGE) {
          this.log.er(`rpc_loadTransactions_success, TRANSACTION COUNTS DO NOT MATCH (maybe last page?)`);
        }

        this.deleteTransactions();

        txResponse.forEach((tx) => {
          this.addTransaction(tx);
        });
        if (this.count !== this.txCount) {
          if (txResponse[txResponse.length - 1]['category'] === 'receive') {
            this.rpc.sendNotification('WoW!!!', 'You have received new transactions');
          } else if (txResponse [txResponse.length - 1] ['category'] === 'stake') {
            this.rpc.sendNotification('WoW!!!', 'You have received new stake reward');
          }
        }
        this.count = this.txCount;
        this.loading = false;
        this.log.d(`rpc_update, txs array: ${this.txs.length}`);
      });

  }

  // Deserializes JSON objects to Transaction classes.
  // This does not enforce statically typed stuff at runtime tho, there is one lib called TypedJSON that does.
  addTransaction(json: Object): void {
    const instance: Transaction = deserialize(json, Transaction);
    if (typeof instance.txid === 'undefined') {
      return;
    }

    // this.txs.push(instance);
    this.txs.unshift(instance);
  }

}

