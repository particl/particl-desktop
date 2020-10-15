import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { OverviewComponent } from './overview.component';
import { BalancesHeaderComponent } from './balances-header/balances-header.component';
import { StakingInfoWidgetComponent } from './widgets/staking-info-widget/staking-info-widget.component';
import { ColdstakeWidgetComponent } from './widgets/coldstake/coldstake-widget.component';
import { DisableColdstakingConfirmationModalComponent } from './widgets/coldstake/disable-coldstaking-confirmation-modal/disable-coldstaking-confirmation-modal.component';
import { ColdStakeModalComponent } from './widgets/coldstake/coldstake-modal/coldstake-modal.component';
import { ZapColdstakingModalComponent } from './widgets/coldstake/zap-coldstaking-modal/zap-coldstaking-modal.component';
import { WalletSharedModule } from '../../shared/wallet-shared.module';


const routes: Routes = [
  { path: '', component: OverviewComponent, data: { title: 'Overview'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    WalletSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    OverviewComponent,
    BalancesHeaderComponent,
    StakingInfoWidgetComponent,
    ColdstakeWidgetComponent,
    ColdStakeModalComponent,
    DisableColdstakingConfirmationModalComponent,
    ZapColdstakingModalComponent
  ],
  entryComponents: [
    DisableColdstakingConfirmationModalComponent,
    ZapColdstakingModalComponent,
    ColdStakeModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OverviewModule { }
