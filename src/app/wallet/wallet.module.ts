import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreUiModule } from '../core-ui/core-ui.module';
import { SharedModule } from './shared/shared.module';
import { WalletModule } from './wallet/wallet.module';

import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { StakinginfoComponent } from './overview/widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './overview/widgets/coldstake/coldstake.component';
import { ZapColdstakingComponent } from './overview/widgets/coldstake/zap-coldstaking/zap-coldstaking.component';
import { RevertColdstakingComponent } from './overview/widgets/coldstake/revert-coldstaking/revert-coldstaking.component';

import 'hammerjs';

import { routing } from './wallet.routing';


@NgModule({
  declarations: [
    OverviewComponent,
    SettingsComponent,
    StakinginfoComponent,
    ColdstakeComponent,
    ZapColdstakingComponent,
    RevertColdstakingComponent
  ],
  imports: [
    CommonModule,
    routing,
    SharedModule,
    WalletModule.forRoot(),
    CoreUiModule
  ],
  entryComponents: [
    ZapColdstakingComponent,
    RevertColdstakingComponent
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WalletViewsModule {
  constructor() {
  }
}
