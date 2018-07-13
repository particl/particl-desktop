import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { CoreModule } from './core/core.module';
import { CoreUiModule } from './core-ui/core-ui.module';
import { InstallerModule } from './installer/installer.module';
import { ModalsModule } from './modals/modals.module';
import { DirectiveModule } from './core-ui/directive/directive.module';

//import { MultiwalletRouterModule } from './multiwallet/multiwallet-router.module';
// import { WalletViewsModule } from './wallet/wallet.module';
import { LoadingComponent } from './loading/loading.component';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    routing,
    /* own */
    DirectiveModule,
    CoreModule.forRoot(),
    CoreUiModule.forRoot(),
    ModalsModule.forRoot(),
    InstallerModule,
    // WalletViewsModule, // shouldn't be needed?
    //MultiwalletRouterModule,
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
