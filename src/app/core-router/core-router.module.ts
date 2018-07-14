import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing } from './app.routing';
import { CoreRouterComponent } from './core-router.component';

import { LoadingComponent } from '../loading/loading.component';
import { MultiwalletRouterComponent } from './multiwallet/multiwallet-router.component';
import { InstallerModule } from 'app/installer/installer.module';

import { WalletViewsModule } from 'app/wallet/wallet.module';
import { MarketModule } from 'app/market/market.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing,
    InstallerModule,
    WalletViewsModule,
    MarketModule
  ],
  declarations: [
    CoreRouterComponent,
    LoadingComponent,
    MultiwalletRouterComponent,
  ],
  exports: [
    CoreRouterComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreRouterModule { }