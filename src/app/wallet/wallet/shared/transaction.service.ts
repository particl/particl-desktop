import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger'
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash'
import { Transaction } from './transaction.model';

import { RpcService } from '../../../core/core.module';
import { NotificationService } from '../../../core/core.module';

@Injectable()
export class TransactionService implements OnDestroy {

  log: any = Log.create('transaction.service');
  private destroyed: boolean = false;

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

    // It doesn't get called sometimes ?
    // this.rpc.state.observe('blocks').throttle(val => Observable.interval(30000/*ms*/)).subscribe(block =>  {
    this.rpc.state.observe('blocks')
      .takeWhile(() => !this.destroyed)
      .subscribe(block => {
          this.countTransactions();
          this.loadTransactions();
      });

      this.rpc.state.observe('txcount')
      .takeWhile(() => !this.destroyed)
      .subscribe(txcount => {
          this.countTransactions();
          this.loadTransactions();
      });


    /* check if testnet -> block explorer url */
    this.rpc.state.observe('chain').take(1)
    .subscribe(chain => this.testnet = chain === 'test');
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  postConstructor(MAX_TXS_PER_PAGE: number): void {
    this.MAX_TXS_PER_PAGE = MAX_TXS_PER_PAGE;
    this.log.d(`postconstructor called txs array: ${this.txs.length}`);
    // TODO: why is this being called twice after executing a tx?
  }

  filter(filters: any): void {
    this.loading = true;
    this.filters = filters;
    this.countTransactions();
    this.loadTransactions();
  }

  changePage(page: number): void {
    if (page < 0) {
      return;
    }
    this.loading = true;
    this.currentPage = page;
    this.loadTransactions();
  }

  /** Load transactions over RPC, then parse JSON and call addTransaction to add them to txs array. */
  loadTransactions(): void {
    this.log.d('loadTransactions() start');

    const options = {
      'count': +this.MAX_TXS_PER_PAGE,
      'skip':  +this.MAX_TXS_PER_PAGE * this.currentPage,
    };
    Object.keys(this.filters).map(filter => options[filter] = this.filters[filter]);

    this.log.d(`loadTransactions, call filtertransactions: ${JSON.stringify(options)}`);
    this.rpc.call('filtertransactions', [options])
    .subscribe((txResponse: Array<Object>) => {

      // The callback will send over an array of JSON transaction objects.
      this.log.d(`loadTransactions, supposedly tx per page: ${this.MAX_TXS_PER_PAGE}`);
      this.log.d(`loadTransactions, real tx per page: ${txResponse.length}`);

      if (txResponse.length !== this.MAX_TXS_PER_PAGE) {
        this.log.er(`loadTransactions, TRANSACTION COUNTS DO NOT MATCH (maybe last page?)`);
      }

        const newTxs: Array<any> = txResponse.map(tx => {
          return new Transaction(tx);
        });

        this.txs = newTxs;

      this.loading = false;
      this.log.d(`loadTransactions, txs array: ${this.txs.length}`);
    });

  }

  /** Count the transactions (for a specific filter) */
  countTransactions(): void {
    const options = {
      'count': 999999,
    };
    Object.keys(this.filters).map(filter => options[filter] = this.filters[filter]);

    this.rpc.call('filtertransactions', [options])
    .subscribe((txResponse: Array<Object>) => {
        this.log.d(`countTransactions, number of transactions after filter: ${txResponse.length}`);
        this.txCount = txResponse.length;
        return;
    });

  }

}
