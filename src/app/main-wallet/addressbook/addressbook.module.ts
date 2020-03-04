import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { WalletSharedModule } from '../shared/wallet-shared.module';

import { AddressBookComponent } from './addressbook.component';
import { DeleteAddressConfirmationModalComponent } from './delete-address-confirmation-modal/delete-address-confirmation-modal.component';
import { NewAddressbookEntryModalComponent } from './new-addressbook-entry-modal/new-addressbook-entry-modal.component';


const routes: Routes = [
  { path: '', component: AddressBookComponent, data: { title: 'Address Book'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    ClipboardModule,
    WalletSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    AddressBookComponent,
    DeleteAddressConfirmationModalComponent,
    NewAddressbookEntryModalComponent
  ],
  entryComponents: [
    DeleteAddressConfirmationModalComponent,
    NewAddressbookEntryModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddressBookModule { }
