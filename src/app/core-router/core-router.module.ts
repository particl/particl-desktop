import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing, CoreRouterComponent } from './app.routing';

import { LoadingComponent } from '../loading/loading.component';
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
    LoadingComponent
  ],
  exports: [
    CoreRouterComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreRouterModule { }
