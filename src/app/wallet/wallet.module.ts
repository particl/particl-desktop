import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreUiModule } from '../core-ui/core-ui.module';
import { SharedModule } from './shared/shared.module';
import { WalletModule } from './wallet/wallet.module';

import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { StakinginfoComponent } from './overview/widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './overview/widgets/coldstake/coldstake.component';
import { ZapWalletsettingsComponent } from './overview/widgets/coldstake/zap-walletsettings/zap-walletsettings.component';

import 'hammerjs';


import { routing } from './wallet.routing';


@NgModule({
  declarations: [
    OverviewComponent,
    SettingsComponent,
    StakinginfoComponent,
    ColdstakeComponent,
    ZapWalletsettingsComponent
  ],
  imports: [
    CommonModule,
    routing,
    SharedModule,
    WalletModule.forRoot(),
    CoreUiModule
  ],
  entryComponents: [
    ZapWalletsettingsComponent
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
  ]
})
export class WalletViewsModule {
  constructor() {
  }
}
