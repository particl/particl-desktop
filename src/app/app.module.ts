import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { NgxElectronModule } from 'ngx-electron';
import { BsDropdownModule, CollapseModule, ModalModule, ModalDirective, PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from './shared/shared.module';
import { SidebarModule } from './core/sidebar/sidebar.module';
import { WalletModule } from './wallet/wallet.module';
import { RpcModule, BlockStatusService } from './core/rpc/rpc.module';
import { ModalsModule } from './modals/modals.module';

import { WindowService } from './core/window.service';

import { AppComponent } from './app.component';

import { StatusComponent } from './core/status/status.component';
import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';

import 'hammerjs';

const routes: Routes = [
  { path: 'overview', component: OverviewComponent, data: { title: 'Overview' } },
  { path: 'settings', component: SettingsComponent, data: { title: 'Settings' } },
  { path: '**', redirectTo: 'overview', pathMatch: 'full' } // Catch all route
];

@NgModule({
  declarations: [
    AppComponent,
    StatusComponent,
    OverviewComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    NgxElectronModule,
    SharedModule,
    SidebarModule.forRoot(),
    WalletModule.forRoot(),
    RpcModule.forRoot(),
    ModalsModule,
    MaterialModule,
    FlexLayoutModule
  ],
  providers: [
    WindowService,
    BlockStatusService
  ],
  bootstrap: [ AppComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor() {
  }
}
