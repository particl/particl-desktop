import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import 'hammerjs';

import { AppComponent } from './app.component';
import { app_routing } from './app.routing';

import { LoadingComponent } from 'app/loading/loading.component';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { InstallerModule } from 'app/installer/installer.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    app_routing,
    InstallerModule,
    MultiwalletModule.forRoot(),
    RpcWithStateModule.forRoot(),
    CoreModule.forRoot(),
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
