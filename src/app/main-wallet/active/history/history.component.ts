import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { defer, iif, Observable, Subject } from 'rxjs';
import { concatMap, finalize, map, take, takeUntil, tap } from 'rxjs/operators';

import { BackendService } from 'app/core/services/backend.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { Particl, ParticlRpcService } from 'app/networks/networks.module';

import {
  CategoryFilterType,
  SortFilterType,
  TransactionFilterType,
  FilterTransactionOptionsModel,
  FilteredTransaction,
  AddressType,
} from '../../shared/transaction-table/transaction-table.models';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { Store } from '@ngxs/store';


interface ICategory {
  title: string;
  value: CategoryFilterType;
  icon: string;
}


interface ISorting {
  title: string;
  value: SortFilterType;
}


interface ITxType {
  title: string;
  value: TransactionFilterType;
}

interface ExportedTransaction {
  dateTime: string;
  isAbandoned: boolean;
  txid: string;
  address: string;
  category: string;
  narration: string;
  fee: number;
  netAmount: number;
  transactionAmount: number;
  isTransferred: boolean;
  isListingFee: boolean;
}

enum TextContent {
  LABEL_DEFAULT_EXPORT_FILENAME_CSV = 'Wallet History - ${walletname} - ${category} - ${type} - ${date}',
  CATEGORY_ALL = 'All transactions',
  CATEGORY_SENT = 'Sent',
  CATEGORY_RECEIVED = 'Received',
  CATEGORY_STAKED = 'Staked',
  CATEGORY_CONVERTED = 'Converted',
  CSV_EXPORTED_SUCCESS = 'Exported Successfully!',
  CSV_EXPORTED_ERROR = 'Export Failed ${reason}',
  LABEL_CATEGORY_MUTISIG_ESCROW = 'Multisig Escrow',
  LABEL_CATEGORY_STAKED = 'Staked',
  LABEL_CATEGORY_ORPHANED_STAKE = 'Orphaned Stake',
  LABEL_CATEGORY_SENT = 'Sent',
  LABEL_CATEGORY_BLINDED_ESCROW = 'Blinded escrow',
  LABEL_CATEGORY_RECEIVED = 'Received',
  LABEL_CATEGORY_CONVERSION = 'Conversion',
  LABEL_CATEGORY_LISTING_FEE = 'Posting Fee',
}

@Component({
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class WalletHistoryComponent implements OnInit, OnDestroy {

  @ViewChild('transactions', {static: true}) transactions: any;

  readonly categories: ICategory[] = [
    { title: TextContent.CATEGORY_ALL,        value: 'all',               icon: ''},
    { title: TextContent.CATEGORY_SENT,       value: 'send',              icon: 'send'},
    { title: TextContent.CATEGORY_RECEIVED,   value: 'receive',           icon: 'receive'},
    { title: TextContent.CATEGORY_STAKED,     value: 'stake',             icon: 'stake'},
    { title: TextContent.CATEGORY_CONVERTED,  value: 'internal_transfer', icon: 'transfer'}
  ];

  readonly sortings: ISorting[] = [
    { title: 'Most recent first',            value: 'time'          },
    { title: 'Largest first',                value: 'amount'        }
  ];

  readonly types: ITxType[] = [
    { title: 'All types', value: 'all'      },
    { title: 'Public',    value: 'standard' },
    { title: 'Blind',     value: 'blind'    },
    { title: 'Anonymous', value: 'anon'     },
  ];

  selectedTab: number = 0;

  filters: FilterTransactionOptionsModel = {
    category: undefined,
    search:   undefined,
    sort:     undefined,
    type:     undefined
  };

  isExporting: boolean = false;


  private destroy$: Subject<void> = new Subject();
  private currentWalletName: string = '';

  constructor(
    private _backendService: BackendService,
    private _snackbar: SnackbarService,
    private _rpcService: ParticlRpcService,
    private _store: Store,
  ) {
    this.setDefault();
  }


  ngOnInit(): void {
    this._store.select(Particl.State.Wallet.Info.getValue('walletname')).pipe(
      tap({
        next: walletName => typeof walletName === 'string'
          ? this.currentWalletName = walletName || 'Default Wallet'
          : '<unknown>',
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  setDefault(): void {
    this.selectedTab = 0;
    this.filters = {
      category: 'all',
      type:     'all',
      sort:     'time',
      search:   ''
    };
  }

  changeCategory(index: number): void {
    this.selectedTab = index;
    this.transactions.resetPagination();
    this.filters.category = this.categories[index].value;
    this.filter();
  }


  filter(): void {
    this.transactions.filter(this.filters);
  }


  clear(): void {
    this.setDefault();
    this.filter();
  }


  exportFilteredHistory(): void {
    if (this.isExporting) {
      return;
    }
    this.isExporting = true;

    const currentDate = new Date();
    const dateLabel = [
      `${currentDate.getFullYear()}`.padStart(2, '0'),
      `${currentDate.getMonth()}`.padStart(2, '0'),
      `${currentDate.getDate()}`.padStart(2, '0'),
      `${currentDate.getHours()}`.padStart(2, '0'),
      `${currentDate.getMinutes()}`.padStart(2, '0')
    ].join('_');

    const selectedCategory = this.categories.find(c => c.value === this.filters.category);
    const selectedType = this.types.find(c => c.value === this.filters.type);
    const filterCategory = selectedCategory ? selectedCategory.title : '';
    const filterType = selectedType ? selectedType.title : '';

    const options = {
      modalType: 'SaveDialog',
      modalOptions: {
        title: 'Save csv',
        defaultPath : TextContent.LABEL_DEFAULT_EXPORT_FILENAME_CSV
          .replace('${walletname}', this.currentWalletName)
          .replace('${category}', filterCategory)
          .replace('${type}', filterType)
          .replace('${date}', dateLabel)
          .replace(/[^a-z0-9]/gi, '_') + '.csv',
        buttonLabel : 'Save',

        properties: ['createDirectory', 'showOverwriteConfirmation'],

        filters : [
          {name: 'csv', extensions: ['csv', ]},
          {name: 'All Files', extensions: ['*']}
        ]
      }
    };

    this._backendService.sendAndWait<string>('gui:gui:open-dialog', options).pipe(
      take(1),
      finalize(() => this.isExporting = false),
      concatMap(path => iif(
        () => (typeof path === 'string') && (path.length > 0),
        defer(async () => {
          const filters: FilterTransactionOptionsModel = {
            count: 99_999,
            skip: 0,
            category: this.filters.category || 'all',
            type: this.filters.type || 'all',
            sort: 'time',
          };
          const histories = await this.getFilteredTransactions(filters).pipe(takeUntil(this.destroy$)).toPromise();
          await this._backendService.sendAndWait<void>('apps:particl-wallet:export-writecsv', path, histories).pipe(
            takeUntil(this.destroy$)
          ).toPromise();
        })
      ))
    ).subscribe(
      () => this._snackbar.open(TextContent.CSV_EXPORTED_SUCCESS),
      (err) => this._snackbar.open(TextContent.CSV_EXPORTED_ERROR.replace('${reason}', err && err.message ? err.message : err))
    );
  }

  private getFilteredTransactions(filters: FilterTransactionOptionsModel): Observable<ExportedTransaction[]> {
    return this._rpcService.call<RPCResponses.FilterTransactions.Response>('filtertransactions', [filters]).pipe(
      map((response) => {
        return response.map(item => {
          const filteredTx = new FilteredTransaction(item);

          let categoryLabel = '';
          if (filteredTx.addressType === AddressType.MULTISIG) {
            categoryLabel = TextContent.LABEL_CATEGORY_MUTISIG_ESCROW;
          } else {
            switch (filteredTx.category) {
              case 'internal_transfer': categoryLabel =
                filteredTx.isListingFee
                  ? TextContent.LABEL_CATEGORY_LISTING_FEE
                  : TextContent.LABEL_CATEGORY_CONVERSION;
                break;
              case 'stake': categoryLabel = TextContent.LABEL_CATEGORY_STAKED; break;
              case 'orphaned_stake': categoryLabel = TextContent.LABEL_CATEGORY_ORPHANED_STAKE; break;
              case 'send': categoryLabel = TextContent.LABEL_CATEGORY_SENT; break;
              case 'unknown': categoryLabel = TextContent.LABEL_CATEGORY_BLINDED_ESCROW; break;
              case 'receive': categoryLabel = TextContent.LABEL_CATEGORY_RECEIVED; break;
            }
          }

          const exportedTx: ExportedTransaction = {
            dateTime: filteredTx.formattedTime,
            isAbandoned: filteredTx.isAbandoned,
            txid: filteredTx.txid,
            address: filteredTx.address,
            category: categoryLabel,
            narration: filteredTx.narration,
            fee: filteredTx.fee,
            netAmount: filteredTx.netAmount,
            transactionAmount: filteredTx.amount,
            isTransferred: filteredTx.category === 'internal_transfer' && !filteredTx.isListingFee,
            isListingFee: filteredTx.isListingFee,
          };

          return exportedTx;
        });
      })
    );
  }
}
