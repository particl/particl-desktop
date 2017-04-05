import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { TransactionsComponent } from './wallet/transactions/transactions.component';
import { SendComponent } from './wallet/send/send.component';
import { AddressComponent } from './wallet/address/address.component';
import { AddressesComponent } from './wallet/addresses/addresses.component';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    SendComponent,
    AddressComponent,
    AddressesComponent,
    OverviewComponent
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
