import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { TransactionsComponent } from './wallet/transactions/transactions.component';
import { SendComponent } from './wallet/transactions/send.component';
import { AddressesComponent } from './wallet/addresses/addresses.component';
import { OverviewComponent } from './core/overview/overview.component';
import { MenuComponent } from './core/menu/menu.component';
import { HeaderComponent } from './core/header/header.component';
import { StatusComponent } from './core/status/status.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    SendComponent,
    AddressesComponent,
    OverviewComponent,
    MenuComponent,
    HeaderComponent,
    StatusComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
