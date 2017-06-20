import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { BsDropdownModule, CollapseModule, PaginationModule } from 'ngx-bootstrap';

import { SharedModule } from './shared/shared.module';
import { SidebarModule } from './core/sidebar/sidebar.module';
import { ModalModule } from './modal/modal.module';
import { WalletModule } from './wallet/wallet.module';

import { WindowService } from './core/window.service';

import { AppComponent } from './app.component';
import { StatusComponent } from './core/status/status.component';
import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';

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
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    RouterModule.forRoot(routes),
    SharedModule,
    SidebarModule.forRoot(),
    ModalModule,
    WalletModule.forRoot()
  ],
  providers: [
    WindowService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
