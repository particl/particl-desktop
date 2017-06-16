import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { TransactionService } from './shared/transaction.service';
import { AddressService } from './shared/address.service';
// TODO: move balance to shared?
import { BalanceService } from './balances/balance.service';


import { TransactionsTableComponent } from './shared/transaction-table/transaction-table.component';
import { AddressTableComponent } from './shared/address-table/address-table.component';

import { AddressBookComponent } from './address-book/address-book.component';
import { SendComponent } from './send/send.component';
import { BalanceComponent } from './balances/balance.component';
import { HistoryComponent } from './history/history.component';

const routes: Routes = [
  {
    path: 'wallet',
    children: [
      { path: 'history', component: HistoryComponent, data: { title: 'History' } },
      { path: 'send', component: SendComponent, data: { title: 'Send' } },
      { path: 'address-book', component: AddressBookComponent, data: { title: 'Address Book' } }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    TransactionsTableComponent,
    AddressTableComponent,
    AddressBookComponent,
    SendComponent,
    BalanceComponent,
    HistoryComponent
  ],
  exports: [
    TransactionsTableComponent,
    AddressTableComponent,
    BalanceComponent
  ],
  providers: []
})
export class WalletModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WalletModule,
      providers: [
        TransactionService,
        AddressService,
        BalanceService
      ]
    };
  }
}
