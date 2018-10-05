import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreUiModule } from '../core-ui/core-ui.module';
import { SharedModule } from './shared/shared.module';
import { WalletModule } from './wallet/wallet.module';
import { SettingsModule } from 'app/wallet/settings/settings.module';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';

import { OverviewComponent } from './overview/overview.component';
import { ProposalsComponent } from './proposals/proposals.component';
import { AddProposalComponent } from './proposals/add-proposal/add-proposal.component';
import { StakinginfoComponent } from './overview/widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './overview/widgets/coldstake/coldstake.component';
import { ZapColdstakingComponent } from './overview/widgets/coldstake/zap-coldstaking/zap-coldstaking.component';
import { RevertColdstakingComponent } from './overview/widgets/coldstake/revert-coldstaking/revert-coldstaking.component';
import { HelpComponent } from './help/help.component';
import { ProposalDetailsComponent } from './proposals/proposal-details/proposal-details.component';

import 'hammerjs';

import { routing } from './wallet.routing';


@NgModule({
  declarations: [
    OverviewComponent,
    ProposalsComponent,
    AddProposalComponent,
    StakinginfoComponent,
    ColdstakeComponent,
    ZapColdstakingComponent,
    RevertColdstakingComponent,
    ProposalDetailsComponent,
    HelpComponent
  ],
  imports: [
    CommonModule,
    routing,
    SharedModule,
    WalletModule.forRoot(),
    CoreUiModule,
    SettingsModule
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
