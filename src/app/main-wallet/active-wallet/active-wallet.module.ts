import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ClipboardModule } from 'ngx-clipboard';
import { QRCodeModule } from 'angularx-qrcode';

import { ActiveWalletRoutingModule } from './active-wallet-routing.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { ActiveWalletBaseComponent } from './base/active-wallet-base.component';

import { OverviewComponent } from './overview/overview.component';
import { BalancesHeaderComponent } from './overview/balances-header/balances-header.component';
import { StakingInfoWidgetComponent } from './overview/widgets/staking-info-widget/staking-info-widget.component';

import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { AddressBookComponent } from './addressbook/addressbook.component';
import { WalletHistoryComponent } from './history/history.component';
import { WalletSettingsComponent } from './settings/settings.component';
import { TransactionsTableComponent } from './transaction-table/transaction-table.component';

import { WalletBackupModalComponent } from './settings/wallet-backup-modal/wallet-backup-modal.component';
import { DetailAddressComponent } from './shared/detail-address/detail-address.component';
import { ReceiveHistoryComponent } from './receive/receive-history/receive-history.component';
import { AddressService } from './shared/address.service';
import { DeleteAddressConfirmationModalComponent } from './addressbook/delete-address-confirmation-modal/delete-address-confirmation-modal.component';
import { NewAddressbookEntryModalComponent } from './addressbook/new-addressbook-entry-modal/new-addressbook-entry-modal.component';
import { SignVerifyAddressModalComponent } from './shared/sign-verify-address-modal/sign-verify-address-modal.component';
import { AddressDetailModalComponent } from './shared/address-detail-modal/address-detail-modal.component';
import { AddressLookupModalComponent } from './send/addresss-lookup-modal/address-lookup-modal.component';
import { SendConfirmationModalComponent } from './send/send-confirmation-modal/send-confirmation-modal.component';
import { ColdstakeWidgetComponent } from './overview/widgets/coldstake/coldstake-widget.component';
import { DisableColdstakingConfirmationModalComponent } from './overview/widgets/coldstake/disable-coldstaking-confirmation-modal/disable-coldstaking-confirmation-modal.component';
import { ColdStakeModalComponent } from './overview/widgets/coldstake/coldstake-modal/coldstake-modal.component';


@NgModule({
  imports: [
    ActiveWalletRoutingModule,
    CommonModule,
    CoreUiModule,
    ClipboardModule,
    MainSharedModule,
    QRCodeModule,
  ],
  declarations: [
    ActiveWalletBaseComponent,
    OverviewComponent,
    SendComponent,
    ReceiveComponent,
    ReceiveHistoryComponent,
    AddressBookComponent,
    WalletHistoryComponent,
    WalletSettingsComponent,
    TransactionsTableComponent,
    BalancesHeaderComponent,
    StakingInfoWidgetComponent,
    SendConfirmationModalComponent,
    WalletBackupModalComponent,
    DetailAddressComponent,
    DeleteAddressConfirmationModalComponent,
    NewAddressbookEntryModalComponent,
    SignVerifyAddressModalComponent,
    AddressDetailModalComponent,
    AddressLookupModalComponent,
    ColdstakeWidgetComponent,
    ColdStakeModalComponent,
    DisableColdstakingConfirmationModalComponent
  ],
  entryComponents: [
    WalletBackupModalComponent,
    SendConfirmationModalComponent,
    DeleteAddressConfirmationModalComponent,
    NewAddressbookEntryModalComponent,
    SignVerifyAddressModalComponent,
    AddressDetailModalComponent,
    AddressLookupModalComponent,
    DisableColdstakingConfirmationModalComponent,
    ColdStakeModalComponent,
  ],
  providers: [
    AddressService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActiveWalletModule { }
