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

  /* states */
  loading: boolean = false;
  testnet: boolean = false;
  txCheck: boolean = false;

  /* How many transactions do we display per page and keep in memory at all times.
     When loading more transactions they are fetched JIT and added to txs. */
  MAX_TXS_PER_PAGE: number = 10;
  PAGE_SIZE_OPTIONS: Array<number> = [5, 10, 20];

  constructor(private rpc: RPCService) {
  }

  postConstructor(MAX_TXS_PER_PAGE: number, txCheck: boolean) {
    this.MAX_TXS_PER_PAGE = MAX_TXS_PER_PAGE;
    this.txCheck = txCheck;
    this.log.d(`postconstructor  called txs array: ${this.txs.length}`);
    // TODO: why is this being called twice after executing a tx?
    this.rpc.state.observe('txcount')
      .subscribe(
        txcount => {
          this.txCount = txcount;
          this.loading = true;
          this.log.d(`observing txcount, txs array: ${this.txs.length}`);
          this.rpc_update();
        });

    /* check if testnet -> block explorer url */
    this.rpc.state.observe('chain').take(1)
    .subscribe(chain => this.testnet = chain === 'test');
  }


  changePage(page: number, txCheck: boolean) {
    if (page < 0) {
      return;
    }
    this.loading = true;
    this.txCheck = txCheck;
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
        if (this.txCheck) {
          this.compareTransactionResponse(this.txs, txResponse);
        } else {
          this.deleteTransactions();
          txResponse.forEach((tx) => {
            this.addTransaction(tx);
          });
        }
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

  compareTransactionResponse(oldTxs: any, newTxs: any) {
    newTxs.forEach((newtx) => {
      oldTxs.forEach((oldtx) => {
        if (oldtx.txid === newtx.txid && oldtx.confirmations !== newtx.confirmations) {
          oldtx.confirmations = newtx.confirmations;
        }
      });
    });
  }

}

