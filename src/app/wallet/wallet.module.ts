import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WalletViewsComponent } from './wallet.component';
import { CoreModule } from '../core/core.module';
import { CoreUiModule } from '../core-ui/core-ui.module';

import { SharedModule } from './shared/shared.module';

import { WalletModule, ReceiveComponent, SendComponent, HistoryComponent, AddressBookComponent } from './wallet/wallet.module';

import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { StakinginfoComponent } from './overview/widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './overview/widgets/coldstake/coldstake.component';

import 'hammerjs';


import { routing } from './wallet.routing';


@NgModule({
  declarations: [
    WalletViewsComponent,
    OverviewComponent,
    SettingsComponent,
    StakinginfoComponent,
    ColdstakeComponent
  ],
  imports: [
    CommonModule,
    routing,
    SharedModule,
    WalletModule.forRoot(),
    CoreUiModule // needed?
  ],
  exports: [
    WalletViewsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
  ],
})
export class WalletViewsModule {
  constructor() {
  }
}
