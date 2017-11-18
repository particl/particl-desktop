import { BrowserModule } from '@angular/platform-browser';
// import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';


import { CoreModule } from './core/core.module';
import { CoreUiModule } from './core-ui/core-ui.module';

import { MultiwalletModule, TestComponent } from './multiwallet/multiwallet.module';
import { WalletViewsModule } from './wallet/wallet.module';

import { AppComponent } from './app.component';
import { routing } from './app.routing';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    //CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    routing,
    /* own */
    CoreModule.forRoot(),
    CoreUiModule,
    MultiwalletModule,
    // WalletViewsModule
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
