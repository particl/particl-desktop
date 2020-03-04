import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { WalletSharedModule } from '../shared/wallet-shared.module';
import { SendComponent } from './send.component';
import { SendConfirmationModalComponent } from './send-confirmation-modal/send-confirmation-modal.component';
import { AddressLookupModalComponent } from './addresss-lookup-modal/address-lookup-modal.component';


const routes: Routes = [
  { path: '', component: SendComponent, data: { title: 'Send'} }
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
    SendComponent,
    SendConfirmationModalComponent,
    AddressLookupModalComponent
  ],
  entryComponents: [
    SendConfirmationModalComponent,
    AddressLookupModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SendModule { }
