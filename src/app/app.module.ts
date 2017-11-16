import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';


import { CoreModule } from './core/core.module';
import { CoreUiModule } from './core-ui/core-ui.module';

import { MultiwalletModule, TestComponent } from './multiwallet/multiwallet.module';
import { WalletViewsModule } from './wallet/wallet.module';

import { AppComponent } from './app.component';
/*
const routes: Routes = [
  { path: 'overview', component: TestComponent, data: { title: 'Overview' } },
  { path: 'settings', component: TestComponent, data: { title: 'Settings' } },
  { path: '**', redirectTo: 'overview', pathMatch: 'full' } // Catch all route
];*/

const routes: Routes = [
  { 
    path: 'overview', 
    component: TestComponent, 
    data: { title: 'Overview' } 
  }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
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
