import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';

import { MaterialModule } from 'app/core-ui/material/material.module';
import { DirectiveModule } from 'app/core-ui/directive/directive.module';

import { InstallerRouterComponent } from './installer.router';

import { CreateWalletComponent } from './create-wallet/create-wallet.component';
import { PassphraseComponent } from 'app/installer/create-wallet/passphrase/passphrase.component';
import { TermsComponent } from './terms/terms.component';
import { ErrorComponent } from './errors/error.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClipboardModule,
    MaterialModule,
    DirectiveModule
  ],
  exports: [InstallerRouterComponent],
  declarations: [
    InstallerRouterComponent,
    CreateWalletComponent,
    PassphraseComponent,
    TermsComponent,
    ErrorComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule {}
