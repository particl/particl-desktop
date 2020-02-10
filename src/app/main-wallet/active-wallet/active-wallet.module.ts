import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ActiveWalletRoutingModule } from './active-wallet-routing.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { ActiveWalletBaseComponent } from './base/active-wallet-base.component';

import { OverviewComponent } from './overview/overview.component';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { AddressBookComponent } from './addressbook/addressbook.component';
import { WalletHistoryComponent } from './history/history.component';
import { WalletSettingsComponent } from './settings/settings.component';
import { TransactionsTableComponent } from './transaction-table/transaction-table.component';
import { BalancesHeaderComponent } from './overview/balances-header/balances-header.component';
import { StakingInfoWidgetComponent } from './overview/widgets/staking-info-widget/staking-info-widget.component';
import { WalletBackupModalComponent } from './settings/wallet-backup-modal/wallet-backup-modal.component';


@NgModule({
  imports: [
    ActiveWalletRoutingModule,
    CommonModule,
    CoreUiModule,
    MainSharedModule
  ],
  declarations: [
    ActiveWalletBaseComponent,
    OverviewComponent,
    SendComponent,
    ReceiveComponent,
    AddressBookComponent,
    WalletHistoryComponent,
    WalletSettingsComponent,
    TransactionsTableComponent,
    BalancesHeaderComponent,
    StakingInfoWidgetComponent,
    WalletBackupModalComponent
  ],
  entryComponents: [
    WalletBackupModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActiveWalletModule { }
