import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../shared/shared.module';

import { TransactionService } from './shared/transaction.service';
import { AddressService } from './shared/address.service';
import { SendService } from './send/send.service';

import { TransactionsTableComponent } from './shared/transaction-table/transaction-table.component';
import { AddressTableComponent } from './shared/address-table/address-table.component';

import { AddressBookComponent } from './address-book/address-book.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendComponent } from './send/send.component';
import { BalanceComponent } from './balances/balance.component';
import { HistoryComponent } from './history/history.component';

import { AddressLookupComponent } from './addresslookup/addresslookup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MdButtonModule, MdCardModule, MdCheckboxModule,
  MdDialogModule, MdExpansionModule, MdGridListModule, MdIconModule, MdInputModule, MdListModule, MdPaginatorModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdSelectModule,
  MdTabsModule,
  MdTooltipModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddAddressLabelComponent } from './receive/modals/add-address-label/add-address-label.component';
import { NewAddressModalComponent } from './address-book/modal/new-address-modal/new-address-modal.component';
import { QrCodeModalComponent } from './shared/qr-code-modal/qr-code-modal.component';
import { SendConfirmationModalComponent } from './send/send-confirmation-modal/send-confirmation-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignatureAddressModalComponent } from './shared/signature-address-modal/signature-address-modal.component';
import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [
  {
    path: 'wallet',
    children: [
      { path: 'receive', component: ReceiveComponent, data: { title: 'Receive' } },
      { path: 'send', component: SendComponent, data: { title: 'Send' } },
      { path: 'history', component: HistoryComponent, data: { title: 'History' } },
      { path: 'address-book', component: AddressBookComponent, data: { title: 'Address Book' } }
    ]
  }
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forChild(routes),
    SharedModule,
    QRCodeModule,
    FormsModule,
    ReactiveFormsModule,
    MdDialogModule,
    FlexLayoutModule,
    MdProgressBarModule,
    MdExpansionModule,
    MdSelectModule,
    MdTooltipModule,
    MdButtonModule,
    MdTabsModule,
    MdGridListModule,
    MdCardModule,
    MdIconModule,
    MdListModule,
    MdInputModule,
    MdCheckboxModule,
    MdRadioModule,
    MdProgressSpinnerModule,
    MdPaginatorModule
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
    SendConfirmationModalComponent,
    SignatureAddressModalComponent
  ],
  exports: [
    TransactionsTableComponent,
    AddressTableComponent,
    BalanceComponent
  ],
  entryComponents: [
    AddAddressLabelComponent,
    NewAddressModalComponent,
    QrCodeModalComponent,
    AddressLookupComponent,
    SendConfirmationModalComponent,
    SignatureAddressModalComponent
  ],
  providers: []
})
export class WalletModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WalletModule,
      providers: [
        TransactionService,
        AddressService,
        SendService
      ]
    };
  }
}
