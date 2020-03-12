import { Component, ViewChild } from '@angular/core';
import {
  CategoryFilterType,
  SortFilterType,
  TransactionFilterType,
  FilterTransactionOptionsModel
} from '../../shared/transaction-table/transaction-table.models';


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

@Component({
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class WalletHistoryComponent {

  @ViewChild('transactions', {static: true}) transactions: any;

  readonly categories: ICategory[] = [
    { title: 'All transactions',   value: 'all',               icon: ''},
    { title: 'Sent',               value: 'send',              icon: 'send'},
    { title: 'Received',           value: 'receive',           icon: 'receive'},
    { title: 'Staked',             value: 'stake',             icon: 'stake'},
    { title: 'Converted',          value: 'internal_transfer', icon: 'transfer'}
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

  constructor() {
    this.setDefault();
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
}
