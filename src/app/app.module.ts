import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

/* BootStrap */
import { AlertModule } from 'ng2-bootstrap';
import { PaginationModule } from 'ng2-bootstrap/pagination';

import { AppComponent } from './app.component';

import { MenuComponent } from './core/menu/menu.component';
import { MenuitemComponent } from './core/menu/menuitem.component';
import { HeaderComponent } from './core/header/header.component';
import { StatusComponent } from './core/status/status.component';
import { OverviewComponent } from './overview/overview.component';
import { AddressesComponent } from './wallet/addresses/addresses.component';
import { SendComponent } from './wallet/transactions/send.component';
import { TransactionsTableComponent } from './wallet/transactions/transaction-table/transaction.table.component';
import { BalanceComponent } from './wallet/balances/balance.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionsTableComponent,
    SendComponent,
    AddressesComponent,
    OverviewComponent,
    MenuComponent,
    HeaderComponent,
    StatusComponent,
    MenuitemComponent,
    BalanceComponent,
  ],
  imports: [
    AlertModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule,
    PaginationModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
