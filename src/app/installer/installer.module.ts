import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard/dist/src/ngx-clipboard';

import { MaterialModule } from 'app/core-ui/material/material.module';
import { DirectiveModule } from 'app/core-ui/directive/directive.module';

// PasswordComponent
import { ModalsModule } from 'app/modals/modals.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';

import { InstallerRouterComponent, installer_routing } from './installer.router';

import { CreateWalletComponent } from './create-wallet/create-wallet.component';
import { PassphraseComponent } from 'app/installer/create-wallet/passphrase/passphrase.component';




@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClipboardModule,
    MaterialModule,
    DirectiveModule,
    ModalsModule, // Only imported for the shared components, TODO: move them.
    MultiwalletModule
  ],
  exports: [
    InstallerRouterComponent
  ],
  declarations: [
    InstallerRouterComponent,
      CreateWalletComponent,
        PassphraseComponent
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule { }
