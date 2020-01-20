import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { WalletSelectionRoutingModule } from './wallet-selection-routing.module';

import { WalletSelectionBaseComponent } from './base/wallet-selection-base.component';
import { WalletSelectComponent } from './wallet-select/wallet-select.component';
import { MainSharedModule } from 'app/main/components/main-shared.module';


@NgModule({
  imports: [
    WalletSelectionRoutingModule,
    CommonModule,
    CoreUiModule,
    MainSharedModule
  ],
  declarations: [
    WalletSelectionBaseComponent,
    WalletSelectComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletSelectionModule { }
