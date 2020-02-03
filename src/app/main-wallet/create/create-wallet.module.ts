import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { CreateWalletRoutingModule } from './create-wallet-routing.module';

import { CreateWalletComponent } from './create-wallet/create-wallet.component';
import { WordsListComponent } from './create-wallet/words-list/words-list.component';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    ClipboardModule,
    CreateWalletRoutingModule
  ],
  declarations: [
    CreateWalletComponent,
    WordsListComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateWalletModule { }
