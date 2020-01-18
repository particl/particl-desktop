import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { NgxsModule } from '@ngxs/store';

import 'hammerjs';

import { app_routing } from 'app/app.routing';

import { CoreModule } from 'app/core/core.module';
import { AppComponent } from 'app/app.component';
import { ApplicationState, ngxsConfig } from 'app/core/store/app.state';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';
import { AppSettingsState } from 'app/core/store/appsettings.state';
import { AppDataState } from 'app/core/store/appdata.state';
import { ZmqConnectionState } from './core/store/zmq-connection.state';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot(
      [ApplicationState, CoreConnectionState, AppSettingsState, AppDataState, ZmqConnectionState],
      ngxsConfig
    ),
    CoreModule,
    app_routing,
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() {
  }
}
