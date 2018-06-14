import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { CoreModule } from './core/core.module';
import { CoreUiModule } from './core-ui/core-ui.module';
import { ModalsModule } from './modals/modals.module';
import { DirectiveModule } from './core-ui/directive/directive.module';

import { MultiwalletModule, TestComponent } from './multiwallet/multiwallet.module';
// import { WalletViewsModule } from './wallet/wallet.module';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/takeWhile';

@NgModule({
  declarations: [
    AppComponent
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
    // WalletViewsModule, // shouldn't be needed?
    MultiwalletModule,
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
