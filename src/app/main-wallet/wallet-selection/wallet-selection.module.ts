import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { WalletSelectionRoutingModule } from './wallet-selection-routing.module';

import { WalletSelectionComponent } from './wallet-selection/wallet-selection.component';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    WalletSelectionRoutingModule
  ],
  declarations: [
    WalletSelectionComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletSelectionModule { }
