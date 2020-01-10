import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { NgxsModule } from '@ngxs/store';

import 'hammerjs';

import { app_routing } from 'app/app.routing';

import { CoreModule } from 'app/core/core.module';
import { AppComponent } from 'app/app.component';
import { ApplicationState, CoreConnectionState, AppSettingsState, ngxsConfig } from 'app/core/store/app.state';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot(
      [ApplicationState, CoreConnectionState, AppSettingsState],
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
