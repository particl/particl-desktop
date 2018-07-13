import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { CoreModule } from './core/core.module';
import { CoreUiModule } from './core-ui/core-ui.module';
import { CoreRouterModule } from './core-router/core-router.module'
import { ModalsModule } from './modals/modals.module';

//import { MultiwalletRouterModule } from './multiwallet/multiwallet-router.module';
// import { WalletViewsModule } from './wallet/wallet.module';


import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    /* own */
    CoreModule.forRoot(),
    CoreUiModule.forRoot(),
    CoreRouterModule,
    ModalsModule.forRoot(),
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
