import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { routing } from 'app/installer/installer.routing';
import { ModalsModule } from 'app/modals/modals.module';

import { InstallerComponent } from './installer.component';
import { EncryptWalletComponent } from './encrypt-wallet/encrypt-wallet.component';

import { CreateWalletComponent } from './create-wallet/create-wallet.component';
import { PassphraseComponent } from './create-wallet/passphrase/passphrase.component';




@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    CoreUiModule.forRoot(),
    routing,
  ],
  declarations: [
    InstallerComponent,
    // encrypt-wallet
    EncryptWalletComponent,
    // create-wallet
    CreateWalletComponent,
    PassphraseComponent
  ],
  exports: [
    InstallerComponent,
    // encrypt-wallet
    EncryptWalletComponent,
    // create-wallet
    CreateWalletComponent,
    PassphraseComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule { }
