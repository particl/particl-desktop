import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { app_routing } from './app.routing';
import { InstallerModule } from 'app/installer/installer.module';
import { RpcModule } from 'app/core/rpc/rpc.module';

import { LoadingComponent } from 'app/loading/loading.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    /* own */
    app_routing,
    InstallerModule,
    RpcModule.forRoot()
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
