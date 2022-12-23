import { Component, Input, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { slideDown } from 'app/core-ui/core.animations';
import { Observable, merge, Subject, defer, of } from 'rxjs';
import { distinctUntilChanged, takeUntil, switchMap, concatMap, tap, skip, catchError } from 'rxjs/operators';

import { Store, Select } from '@ngxs/store';
import { Particl } from 'app/networks/networks.module';

import { TransactionService } from './transactions.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';

import { FilterTransactionOptionsModel, FilteredTransaction, AddressType, TxTransferType } from './transaction-table.models';
import { WalletURLState } from '../state-store/wallet-store.state';


enum TextContent {
  FETCH_ERROR = 'An error occurred while fetching the transactions',
  TXID_COPIED = 'TX ID copied to the cliboard',
  TX_ABANDON_SUCCESS = 'Successfully abandoned tx: {txid}',
  TX_ABANDON_ERROR = 'Failed to abandon/cancel that transaction',
}


@Component({
  selector: 'transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  providers: [TransactionService],
  animations: [slideDown()]
})
export class TransactionsTableComponent implements AfterViewInit, OnDestroy {

  @Input() showPagination: boolean = true;
  @Input() loadOnInit: boolean = true;
  @Input() count: number = 10;
  @ViewChild('paginator', {static: false}) paginator: any;

  txUrl: string = '';

  TypeOfAddress: typeof AddressType = AddressType;
  TypeOfTransfer: typeof TxTransferType = TxTransferType;
  isLoading: boolean = true;
  txns: FilteredTransaction[] = [];


  readonly PageSizeOptions: number[] = [10, 25, 50, 100, 250];

  private destroy$: Subject<void> = new Subject();
  private filter$: Subject<void> = new Subject();

  private _filters: FilterTransactionOptionsModel = {};
  private pageCount: number = 0;
  private expandedTransactionID: string = '';
  private txMaxCount: number;
  private defaultPageCount: number = 10;

  constructor(
    private _store: Store,
    private _txservice: TransactionService,
    private _snackbar: SnackbarService
  ) {}

  ngAfterViewInit(): void {

    const blockWatcher$ = this._store.select(Particl.State.ZMQ.getData('hashblock')).pipe(
      skip(1),  // skip the first, as this will trigger on first access of the store value
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const walletSwitcher$ = this._store.select(Particl.State.Wallet.Info.getValue('walletname')).pipe(
      skip(1),  // skip the first, as this will trigger on first access of the store value
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const obsList: Observable<any>[] = [];

    obsList.push(this.filter$);
    obsList.push(blockWatcher$);
    obsList.push(walletSwitcher$);

    merge(...obsList).pipe(
      switchMap(() => defer(() => this.fetchTransactionInfo())),
      takeUntil(this.destroy$)
    ).subscribe(
      (txns: FilteredTransaction[]) => {
        this.txns = txns;
        this.isLoading = false;
      },
      (err) => {
        this._snackbar.open(TextContent.FETCH_ERROR, 'err');
      }
    );

    // fetch the relevant transaction explorer URL
    this._store.select(WalletURLState.get('transaction')).pipe(
      tap({
        next: (txUrl) => {
          this.txUrl = typeof txUrl === 'string' ? txUrl : '';
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();


    if (this.loadOnInit) {
      this.filter$.next();
    }
  }


  ngOnDestroy(): void {
    this.filter$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  get expandedTxId(): string {
    return this.expandedTransactionID;
  }


  get totalTransactionCount(): number {
    return this.txMaxCount;
  }


  get TxCountPerPage(): number {
    return this._filters.count || +this.count || this.defaultPageCount;
  }


  public filter(filters: FilterTransactionOptionsModel): void {
    this.txMaxCount = undefined;
    this._filters = filters;
    this.filter$.next();
  }


  public resetPagination(): void {
    if (this.paginator) {
      this.paginator.resetPagination(0);
      this.filter$.next();
    }
  }


  public pageChanged(ev: any) {
    this.pageCount = ev.pageIndex;
    if (typeof ev.pageSize === 'number' && ev.pageSize > 0) {
      this._filters.count = Math.floor(ev.pageSize);
    }
    this.filter$.next();
  }


  public styleConfimations(confirm: number, required: number, isAbandoned: boolean = false): string {
    if (isAbandoned || (confirm >= required)) {
      return 'confirm-ok';
    }

    if (confirm <= 0) {
      return 'confirm-none';
    }

    return 'confirm-1';

  }


  public showTransactionDetail(tx: FilteredTransaction): void {
    this.expandedTransactionID = this.expandedTransactionID === tx.txid ? '' : tx.txid;
  }


  public txTrackByFn(idx: number, item: FilteredTransaction) {
    return item.txid;
  }


  copyToClipBoard(): void {
    this._snackbar.open(TextContent.TXID_COPIED);
  }


  abandonTransaction(txid: string): void {
    if (!txid.length) {
      return;
    }
    this._txservice.abandonTransaction(txid).pipe(
      catchError(() => of(false))
    ).subscribe(
      (success) => {
        if (!success) {
          this._snackbar.open(TextContent.TX_ABANDON_ERROR, 'warn');
          return;
        }

        this._snackbar.open(TextContent.TX_ABANDON_SUCCESS.replace('{txid}', txid));
        const txn = this.txns.find(t => t.txid === txid);
        if (txn) {
          txn.isAbandoned = true;
        }
      }
    );
  }



  private fetchTransactionInfo(): Observable<FilteredTransaction[]> {
    this._filters.count = this.TxCountPerPage;
    this._filters.skip = this.pageCount * this._filters.count;

    const filterRequest$ = this._txservice.getFilteredTransactions(this._filters);

    if (!this.showPagination) {
      // Only fetch the requested number of items
      return filterRequest$;
    }

    // Pagination is displayed, so need to check for the total number of available transactions as well.

    const countFilters = Object.assign({}, this._filters);
    countFilters.count = 99999;
    countFilters.skip = 0;

    const count$ = this._txservice.getFilteredTransactions(countFilters).pipe(

      tap((txResp: FilteredTransaction[]) => {
        // @TODO zaSmilingIdiot 2020-01-25 -> this is an attempt at a crappy workaround to update the paginator total count.
        //    A proper fix requires a proper paginator implementation, one that allows dynamic total updates.
        if (txResp.length !== this.totalTransactionCount) {
          this.showPagination = false;
        }
      }),

      concatMap((txResp: FilteredTransaction[]) => {
        this.showPagination = true;
        this.txMaxCount = txResp.length;
        return filterRequest$;
      })
    );

    return count$;
  }

}
