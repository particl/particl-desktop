import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreUiModule } from '../core-ui/core-ui.module';
import { SharedModule } from './shared/shared.module';
import { WalletModule } from './wallet/wallet.module';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';

import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { ProposalsComponent } from './proposals/proposals.component';
import { AddProposalComponent } from './proposals/add-proposal/add-proposal.component';
import { StakinginfoComponent } from './overview/widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './overview/widgets/coldstake/coldstake.component';
import { ZapColdstakingComponent } from './overview/widgets/coldstake/zap-coldstaking/zap-coldstaking.component';
import { RevertColdstakingComponent } from './overview/widgets/coldstake/revert-coldstaking/revert-coldstaking.component';
import { HelpComponent } from './help/help.component';

import 'hammerjs';

import { routing } from './wallet.routing';
import { ProposalDetailsComponent } from './proposals/proposal-details/proposal-details.component';


@NgModule({
  declarations: [
    OverviewComponent,
    SettingsComponent,
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
    CoreUiModule
  ],
  entryComponents: [
    ZapColdstakingComponent,
    RevertColdstakingComponent
  ],
  exports: [],
  providers: [
    ProposalsService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WalletViewsModule {
  constructor() {
  }
}
