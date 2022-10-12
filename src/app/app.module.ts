import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { NgxsModule } from '@ngxs/store';

import 'hammerjs';

import { app_routing } from 'app/app.routing';

import { CoreModule } from 'app/core/core.module';
import { AppComponent } from 'app/app.component';
import {
  ApplicationState,
  ApplicationConfigState,
  ngxsConfig
} from 'app/core/app-global-state/app.state';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot(
      [ApplicationState, ApplicationConfigState],
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
