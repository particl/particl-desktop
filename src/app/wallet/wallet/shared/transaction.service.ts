import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger'
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash'
import { Transaction } from './transaction.model';

import { RpcService } from '../../../core/core.module';
import { NotificationService } from '../../../core/core.module';


@Injectable()
export class TransactionService {

  log: any = Log.create('transaction.service');

  /* Stores transactions objects. */
  txs: Transaction[] = [];

  /* Pagination stuff */
  txCount:        number = 0;
  currentPage:    number = 0;
  totalPageCount: number = 0;

  filters: any = {
    watchonly: undefined,
    category:  undefined,
    search:    undefined,
    type:      undefined,
    sort:      undefined
  };

  /* Blocks */
  block: number = 0;
  /* states */
  loading: boolean = false;
  testnet: boolean = false;
  checkBlock: boolean = false;

  /* How many transactions do we display per page and keep in memory at all times.
     When loading more transactions they are fetched JIT and added to txs. */
  MAX_TXS_PER_PAGE: number = 10;
  PAGE_SIZE_OPTIONS: Array<number> = [10, 25, 50, 100, 250];

  constructor(private rpc: RpcService, private notification: NotificationService) {
    this.log.d(`Constructor(): called`);
    this.postConstructor(this.MAX_TXS_PER_PAGE);

    this.txCount = this.rpc.state.get('txcount');
    this.block = this.rpc.state.get('blocks');

    this.rpc.state.observe('txcount')
      .subscribe(
        txcount => {
          if (this.txCount === undefined) {
            this.txCount = txcount;
          }
          if (txcount > this.txCount) {
              this.txCount = txcount;
              this.newTransaction();
            } else {
              this.loading = true;
              this.log.d(`observing txcount, txs array: ${this.txs.length}`);
              this.rpc_update();
            }
          // this.txCount = txcount;
        });

    // It doesn't get called sometimes ?
    // this.rpc.state.observe('blocks').throttle(val => Observable.interval(30000/*ms*/)).subscribe(block =>  {
    this.rpc.state.observe('blocks').subscribe(block =>  {
      if (this.block === undefined) {
        this.block = block;
      }
      if (block > this.block) {
        this.checkBlock = true;
        this.rpc_update()
      }
    });

    /* check if testnet -> block explorer url */
    this.rpc.state.observe('chain').take(1)
    .subscribe(chain => this.testnet = chain === 'test');
  }

  postConstructor(MAX_TXS_PER_PAGE: number): void {
    this.MAX_TXS_PER_PAGE = MAX_TXS_PER_PAGE;
    this.log.d(`postconstructor called txs array: ${this.txs.length}`);
    // TODO: why is this being called twice after executing a tx?
  }

  filter(filters: any): void {
    this.loading = true;
    this.filters = filters;
    this.rpc_update(true); /* count transactions before getting this page */
    this.rpc_update();
  }

  changePage(page: number): void {
    if (page < 0) {
      return;
    }
    this.loading = true;
    this.currentPage = page;
    this.rpc_update();
  }

  deleteTransactions(): void {
    this.txs = [];
  }

  /** Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array. */
  rpc_update(justCount?: boolean): void {

    const options = {
      'count': +this.MAX_TXS_PER_PAGE,
      'skip':  +this.MAX_TXS_PER_PAGE * this.currentPage,
    };
    Object.keys(this.filters).map(filter => options[filter] = this.filters[filter]);

    if (justCount) {
      // TODO: change for next release of daemon
      // options.count = 0;
      options.count = 999999;
      delete options.skip;
    }

    this.log.d(`call filtertransactions: ${JSON.stringify(options)}`);
    this.rpc.call('filtertransactions', [options])
    .subscribe((txResponse: Array<Object>) => {

      if (justCount) {
        this.log.d(`number of transactions after filter: ${txResponse.length}`);
        this.txCount = txResponse.length;
        return ;
      }

      // The callback will send over an array of JSON transaction objects.
      this.log.d(`rpc_loadTransactions_success, supposedly tx per page: ${this.MAX_TXS_PER_PAGE}`);
      this.log.d(`rpc_loadTransactions_success, real tx per page: ${txResponse.length}`);

      if (txResponse.length !== this.MAX_TXS_PER_PAGE) {
        this.log.er(`rpc_loadTransactions_success, TRANSACTION COUNTS DO NOT MATCH (maybe last page?)`);
      }

      if (this.checkBlock) {
        this.checkBlock = false;
        this.compareTransactionResponse(this.txs, txResponse);
      } else {
        this.deleteTransactions();
        txResponse.map(tx => {
          this.addTransaction(tx);
        });
      }

      this.loading = false;
      this.log.d(`rpc_update, txs array: ${this.txs.length}`);
    });

  }

  // Deserializes JSON objects to Transaction classes.
  addTransaction(json: Object): void {
    this.txs.push(new Transaction(json));
  }

  newTransaction(): void {
    this.rpc.call('filtertransactions')
      .subscribe(
        (tx: Array<Object>) => {
          if (tx[0]['category'] === 'receive') {
              this.notification.sendNotification(
                'Incoming transaction', tx[0]['amount'] + ' PART received');
          } else if (tx[0]['category'] === 'stake') {
              this.notification.sendNotification(
                'New stake reward', tx[0]['amount'] + ' PART received');
          }
          if (this.currentPage === 0) {
            // Not sure why max txs per page has 5
            this.MAX_TXS_PER_PAGE = 10;
            this.checkForNewTransaction(this.txs, tx);
          }
        });
  }

   // Compare old and new transactions to find out updated confirmations
  compareTransactionResponse(oldTxs: any, newTxs: any) {
    newTxs.forEach((newtx) => {
      oldTxs.forEach((oldtx) => {
        if (oldtx.txid === newtx.txid && oldtx.confirmations !== newtx.confirmations) {
          oldtx.confirmations = newtx.confirmations;
        }
      });
    });
  }

  checkForNewTransaction(oldTxs: any, newTxs: any) {
    const newTransaction = _(newTxs).differenceBy(oldTxs, 'txid').value();
    newTransaction.map(tx => {
      this.unShiftTransactions(tx);
    });
  }

  unShiftTransactions(json: Object) {
    if (this.txs.length === this.MAX_TXS_PER_PAGE) {
      this.txs.pop();
    }
    this.txs.unshift(new Transaction(json));
  }

}
