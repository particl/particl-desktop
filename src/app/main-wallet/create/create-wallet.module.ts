import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { CreateWalletRoutingModule } from './create-wallet-routing.module';

import { CreateWalletComponent } from './create-wallet/create-wallet.component';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    CreateWalletRoutingModule
  ],
  declarations: [
    CreateWalletComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateWalletModule { }
