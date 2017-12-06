import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule } from '../core/core.module';
import { CoreUiModule } from '../core-ui/core-ui.module';

import { SharedModule } from './shared/shared.module';

import { WalletModule, ReceiveComponent, SendComponent, HistoryComponent, AddressBookComponent } from './wallet/wallet.module';

import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { StakinginfoComponent } from './overview/widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './overview/widgets/coldstake/coldstake.component';
import { ConsoleModalComponent } from './settings/modal/help-modal/console-modal.component';

import 'hammerjs';


import { routing } from './wallet.routing';


@NgModule({
  declarations: [
    OverviewComponent,
    SettingsComponent,
    StakinginfoComponent,
    ColdstakeComponent,
    ConsoleModalComponent
  ],
  imports: [
    CommonModule,
    routing,
    SharedModule,
    WalletModule.forRoot(),
    CoreUiModule
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
  ],
  entryComponents: [
    ConsoleModalComponent
  ]
})
export class WalletViewsModule {
  constructor() {
  }
}
