import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { QRCodeModule } from 'angularx-qrcode';

import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { AddressService } from './address.service';
import { TransactionsTableComponent } from './transaction-table/transaction-table.component';
import { MainSharedModule } from 'app/main/components/main-shared.module';
import { DetailAddressComponent } from './detail-address/detail-address.component';
import { AddressDetailModalComponent } from './address-detail-modal/address-detail-modal.component';
import { SignVerifyAddressModalComponent } from './sign-verify-address-modal/sign-verify-address-modal.component';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    MainSharedModule,
    ClipboardModule,
    QRCodeModule
  ],
  declarations: [
    TransactionsTableComponent,
    DetailAddressComponent,
    AddressDetailModalComponent,
    SignVerifyAddressModalComponent
  ],
  exports: [
    TransactionsTableComponent,
    DetailAddressComponent,
    AddressDetailModalComponent,
    SignVerifyAddressModalComponent
  ],
  entryComponents: [
    AddressDetailModalComponent,
    SignVerifyAddressModalComponent
  ],
  providers: [
    AddressService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletSharedModule { }
