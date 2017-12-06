import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger'
import { Observable } from 'rxjs/Observable';

import { Transaction } from './transaction.model';

import { RpcService } from '../../../core/core.module';
import { NotificationService } from '../../../core/core.module';


@Injectable()
export class TransactionService {

  log: any = Log.create('transaction.service');

  /* Stores transactions objects. */
  txs: Transaction[] = [];

  /* Pagination stuff */
  txCount: number = 0;
  currentPage: number = 0;
  totalPageCount: number = 0;

  /* Blocks */
  block: number = 0;
  /* states */
  loading: boolean = false;
  testnet: boolean = false;


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
          this.loading = true;
          if (txcount > this.txCount) {
            this.newTransaction();
          }
          this.log.d(`observing txcount, txs array: ${this.txs.length}`);
          this.rpc_update();
        });

    this.rpc.state.observe('blocks').throttle(val => Observable.interval(30000/*ms*/)).subscribe(block =>  this.rpc_update());

    /* check if testnet -> block explorer url */
    this.rpc.state.observe('chain').take(1)
    .subscribe(chain => this.testnet = chain === 'test');
  }

  postConstructor(MAX_TXS_PER_PAGE: number) {
    this.MAX_TXS_PER_PAGE = MAX_TXS_PER_PAGE;
    this.log.d(`postconstructor called txs array: ${this.txs.length}`);
    // TODO: why is this being called twice after executing a tx?

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

    const options = {
      'count': +this.MAX_TXS_PER_PAGE,
      'skip': this.currentPage * this.MAX_TXS_PER_PAGE
    };
    this.rpc.call('filtertransactions', [options])
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

        this.loading = false;
        this.log.d(`rpc_update, txs array: ${this.txs.length}`);
      });

  }

  // Deserializes JSON objects to Transaction classes.
  addTransaction(json: Object): void {
    this.txs.push(new Transaction(json));
  }


  newTransaction() {
    this.rpc.call('filtertransactions')
      .subscribe(
        (tx: Array<Object>) => {
          if (tx[0]['category'] === 'receive') {
              this.notification.sendNotification('Incoming transaction', tx[0]['amount'] + ' PART received');
          } else if (tx[0]['category'] === 'stake') {
              this.notification.sendNotification('New stake reward', tx[0]['amount'] + ' PART received');
          }
        });
  }

}
