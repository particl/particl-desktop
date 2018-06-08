import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { TransactionService } from './shared/transaction.service';
import { AddressService } from './shared/address.service';
import { SendService } from './send/send.service';
import { ColdstakeService } from '../overview/widgets/coldstake/coldstake.service';

import { TransactionsTableComponent } from './shared/transaction-table/transaction-table.component';
import { AddressTableComponent } from './shared/address-table/address-table.component';

import { AddressBookComponent } from './address-book/address-book.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendComponent } from './send/send.component';
import { BalanceComponent } from './balances/balance.component';
import { HistoryComponent } from './history/history.component';

import { AddressLookupComponent } from './addresslookup/addresslookup.component';

import { AddAddressLabelComponent } from './receive/modals/add-address-label/add-address-label.component';
import { NewAddressModalComponent } from './address-book/modal/new-address-modal/new-address-modal.component';
import { QrCodeModalComponent } from './shared/qr-code-modal/qr-code-modal.component';
import { SignatureAddressModalComponent } from './shared/signature-address-modal/signature-address-modal.component';
import { FixWalletModalComponent } from './send/fix-wallet-modal/fix-wallet-modal.component';
import { WalletFixedConfirmationComponent } from './send/fix-wallet-modal/wallet-fixed-confirmation/wallet-fixed-confirmation.component';



@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreUiModule.forRoot(),
    QRCodeModule
  ],
  declarations: [
    TransactionsTableComponent,
    AddressTableComponent,
    ReceiveComponent,
    SendComponent,
    HistoryComponent,
    AddressBookComponent,
    BalanceComponent,
    AddressLookupComponent,
    AddAddressLabelComponent,
    NewAddressModalComponent,
    QrCodeModalComponent,
    SignatureAddressModalComponent,
    FixWalletModalComponent,
    WalletFixedConfirmationComponent
  ],
  exports: [
    TransactionsTableComponent,
    AddressTableComponent,
    BalanceComponent,
    /* sidebar lazy load*/
    ReceiveComponent,
    SendComponent,
    HistoryComponent,
    AddressBookComponent

  ],
  entryComponents: [
    AddAddressLabelComponent,
    NewAddressModalComponent,
    QrCodeModalComponent,
    AddressLookupComponent,
    SignatureAddressModalComponent,
    /* modals for wallet fix */
    FixWalletModalComponent,
    WalletFixedConfirmationComponent
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WalletModule,
      providers: [
        AddressService,
        SendService,
        ColdstakeService
      ]
    };
  }
}


export { AddressBookComponent } from './address-book/address-book.component';
export { ReceiveComponent } from './receive/receive.component';
export { SendComponent } from './send/send.component';
export { BalanceComponent } from './balances/balance.component';
export { HistoryComponent } from './history/history.component';
