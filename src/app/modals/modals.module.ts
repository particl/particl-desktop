import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

import { ModalsService } from './modals.service';
import { ModalsComponent } from './modals.component';
import { Focus } from './modals.directives';

import { PassphraseComponent } from './createwallet/passphrase/passphrase.component';
import { PasswordComponent } from './shared/password/password.component';

import { CreateWalletComponent } from './createwallet/createwallet.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ClipboardModule
  ],
  declarations: [
    Focus,
    ModalsComponent,
    PassphraseComponent,
    PasswordComponent,
    CreateWalletComponent,
    SyncingComponent,
    UnlockwalletComponent
  ],
  exports: [
    ModalsComponent
  ],
  providers: [ModalsService]
})
export class ModalsModule { }
