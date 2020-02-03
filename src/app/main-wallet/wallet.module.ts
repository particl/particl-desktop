import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { WalletRoutingModule } from './wallet-routing.module';

import { WalletBaseComponent } from './base/wallet-base.component';
import { ActiveWalletGuard } from './active-wallet/active-wallet.guard';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    WalletRoutingModule
  ],
  declarations: [
    WalletBaseComponent
  ],
  providers: [
    ActiveWalletGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletModule { }
